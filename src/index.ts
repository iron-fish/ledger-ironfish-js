/** ******************************************************************************
 *  (c) 2019-2020 Zondax GmbH
 *  (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */
import GenericApp, {
  ConstructorParams,
  LedgerError,
  PAYLOAD_TYPE,
  Transport,
  errorCodeToString,
  processErrorResponse,
} from '@zondax/ledger-js'

import { P2_VALUES, REDJUBJUB_SIGNATURE_LEN } from './consts'
import { processGetIdentityResponse, processGetKeysResponse } from './helper'
import { IronfishIns, IronfishKeys, KeyResponse, ResponseIdentity, ResponseSign } from './types'

export * from './types'

export default class IronfishApp extends GenericApp {
  readonly INS!: IronfishIns
  constructor(transport: Transport) {
    if (transport == null) throw new Error('Transport has not been defined')

    const params: ConstructorParams = {
      cla: 0x59,
      ins: {
        GET_VERSION: 0x00,
        GET_KEYS: 0x01,
        SIGN: 0x02,
        //DKG Instructions
        GET_IDENTITY: 0x10,
        DKG_ROUND_1: 0x11,
      },
      p1Values: {
        ONLY_RETRIEVE: 0x00,
        SHOW_ADDRESS_IN_DEVICE: 0x01,
      },
      acceptedPathLengths: [3],
      chunkSize: 250,
    }
    super(transport, params)
  }

  async retrieveKeys(path: string, keyType: IronfishKeys, showInDevice: boolean): Promise<KeyResponse> {
    const serializedPath = this.serializePath(path)
    const p1 = showInDevice ? this.P1_VALUES.SHOW_ADDRESS_IN_DEVICE : this.P1_VALUES.ONLY_RETRIEVE

    return await this.transport
      .send(this.CLA, this.INS.GET_KEYS, p1, keyType, serializedPath, [LedgerError.NoErrors])
      .then(response => processGetKeysResponse(response, keyType), processErrorResponse)
  }

  async signChunk(ins: number, chunkIdx: number, chunkNum: number, chunk: Buffer): Promise<ResponseSign> {
    let payloadType = PAYLOAD_TYPE.ADD
    if (chunkIdx === 1) {
      payloadType = PAYLOAD_TYPE.INIT
    }
    if (chunkIdx === chunkNum) {
      payloadType = PAYLOAD_TYPE.LAST
    }

    return await this.transport
      .send(this.CLA, ins, payloadType, P2_VALUES.DEFAULT, chunk, [
        LedgerError.NoErrors,
        LedgerError.DataIsInvalid,
        LedgerError.BadKeyHandle,
        LedgerError.SignVerifyError,
      ])
      .then((response: Buffer) => {
        const errorCodeData = response.subarray(-2)
        const returnCode = errorCodeData[0] * 256 + errorCodeData[1]
        let errorMessage = errorCodeToString(returnCode)

        if (
          returnCode === LedgerError.BadKeyHandle ||
          returnCode === LedgerError.DataIsInvalid ||
          returnCode === LedgerError.SignVerifyError
        ) {
          errorMessage = `${errorMessage} : ${response.subarray(0, response.length - 2).toString('ascii')}`
        }

        if (returnCode === LedgerError.NoErrors && response.length == (2 + REDJUBJUB_SIGNATURE_LEN)) {
          const signature = response.subarray(0, REDJUBJUB_SIGNATURE_LEN)

          return {
            signature,
            returnCode,
            errorMessage,
          }
        }

        return {
          returnCode,
          errorMessage,
        }
      }, processErrorResponse)
  }

  signSendChunk(chunkIdx: number, chunkNum: number, chunk: Buffer): Promise<ResponseSign> {
    return this.signChunk(this.INS.SIGN, chunkIdx, chunkNum, chunk);
  }

  signDkgRound1Chunk(chunkIdx: number, chunkNum: number, chunk: Buffer): Promise<ResponseSign> {
    return this.signChunk(this.INS.DKG_ROUND_1, chunkIdx, chunkNum, chunk);
  }

  async sign(path: string, blob: Buffer): Promise<ResponseSign> {
    const chunks = this.prepareChunks(path, blob)
    return await this.signSendChunk(1, chunks.length, chunks[0]).then(async response => {
      let result: ResponseSign = {
        returnCode: response.returnCode,
        errorMessage: response.errorMessage,
      }

      for (let i = 1; i < chunks.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        result = await this.signSendChunk(1 + i, chunks.length, chunks[i])
        if (result.returnCode !== LedgerError.NoErrors) {
          break
        }
      }
      return result
    }, processErrorResponse)
  }

  async dkgGetIdentity(): Promise<ResponseIdentity> {
    return await this.transport
        .send(this.CLA, this.INS.GET_IDENTITY, 0, 0, undefined, [LedgerError.NoErrors])
        .then(response => processGetIdentityResponse(response), processErrorResponse)
  }

  async dkgRound1(path: string, identities: string[], minSigners: number): Promise<ResponseIdentity> {
    let blob = Buffer
        .alloc(1 + identities.length * 129 + 1);

    blob.writeUint8(identities.length);
    for (let i = 0; i < identities.length; i++) {
      blob.fill(Buffer.from(identities[i], "hex"), 1 + (i * 129))
    }
    blob.writeUint8(minSigners, 1 + identities.length * 129);

    const chunks = this.prepareChunks(path, blob)

    return await this.signDkgRound1Chunk(1, chunks.length, chunks[0]).then(async response => {
      let result: ResponseSign = {
        returnCode: response.returnCode,
        errorMessage: response.errorMessage,
      }

      for (let i = 1; i < chunks.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        result = await this.signDkgRound1Chunk(1 + i, chunks.length, chunks[i])
        if (result.returnCode !== LedgerError.NoErrors) {
          break
        }
      }
      return result
    }, processErrorResponse)
  }
}
