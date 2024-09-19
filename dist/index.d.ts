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
import GenericApp, { Transport } from '@zondax/ledger-js';
import { ResponsePayload } from '@zondax/ledger-js/dist/payload';
import { IronfishIns, IronfishKeys, KeyResponse, ResponseDkgBackupKeys, ResponseDkgGetCommitments, ResponseDkgGetPublicPackage, ResponseDkgRound1, ResponseDkgRound2, ResponseDkgSign, ResponseIdentity, ResponseReviewTransaction, ResponseSign } from './types';
export * from './types';
export default class IronfishApp extends GenericApp {
    readonly INS: IronfishIns;
    constructor(transport: Transport, dkgMode?: boolean);
    retrieveKeys(path: string, keyType: IronfishKeys, showInDevice: boolean): Promise<KeyResponse>;
    sign(path: string, blob: Buffer): Promise<ResponseSign>;
    dkgGetIdentity(index: number): Promise<ResponseIdentity>;
    dkgRound1(index: number, identities: string[], minSigners: number): Promise<ResponseDkgRound1>;
    dkgRound2(index: number, round1PublicPackages: string[], round1SecretPackage: string): Promise<ResponseDkgRound2>;
    dkgRound3Min(index: number, participants: string[], round1PublicPkgs: string[], round2PublicPkgs: string[], round2SecretPackage: string, gskBytes: string[]): Promise<void>;
    dkgGetCommitments(tx_hash: string): Promise<ResponseDkgGetCommitments>;
    dkgSign(pkRandomness: string, frostSigningPackage: string, txHash: string): Promise<ResponseDkgSign>;
    dkgGetPublicPackage(): Promise<ResponseDkgGetPublicPackage>;
    dkgBackupKeys(): Promise<ResponseDkgBackupKeys>;
    dkgRetrieveKeys(keyType: IronfishKeys): Promise<KeyResponse>;
    dkgRestoreKeys(encryptedKeys: string): Promise<void>;
    reviewTransaction(tx: string): Promise<ResponseReviewTransaction>;
    getResult(rawResponse: ResponsePayload): Promise<Buffer>;
}
