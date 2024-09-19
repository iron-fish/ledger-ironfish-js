"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const ledger_js_1 = __importStar(require("@zondax/ledger-js"));
const consts_1 = require("./consts");
const deserialize_1 = require("./deserialize");
const helper_1 = require("./helper");
const serialize_1 = require("./serialize");
__exportStar(require("./types"), exports);
const DUMMY_PATH = "m/44'/1338'/0";
class IronfishApp extends ledger_js_1.default {
    constructor(transport, dkgMode) {
        if (transport == null)
            throw new Error('Transport has not been defined');
        const params = {
            cla: dkgMode ? 0x63 : 0x59,
            ins: {
                GET_VERSION: 0x00,
                GET_KEYS: 0x01,
                SIGN: 0x02,
                //DKG Instructions
                DKG_IDENTITY: 0x10,
                DKG_ROUND_1: 0x11,
                DKG_ROUND_2: 0x12,
                DKG_ROUND_3_MIN: 0x13,
                DKG_GET_COMMITMENTS: 0x14,
                DKG_SIGN: 0x15,
                DKG_GET_KEYS: 0x16,
                DKG_GET_NONCES: 0x17,
                DKG_GET_PUBLIC_PACKAGE: 0x18,
                DKG_BACKUP_KEYS: 0x19,
                DKG_RESTORE_KEYS: 0x1a,
                GET_RESULT: 0x1b,
                REVIEW_TX: 0x1c,
            },
            p1Values: {
                ONLY_RETRIEVE: 0x00,
                SHOW_ADDRESS_IN_DEVICE: 0x01,
            },
            acceptedPathLengths: [3],
            chunkSize: 250,
        };
        super(transport, params);
    }
    async retrieveKeys(path, keyType, showInDevice) {
        const serializedPath = this.serializePath(path);
        const p1 = showInDevice ? this.P1_VALUES.SHOW_ADDRESS_IN_DEVICE : this.P1_VALUES.ONLY_RETRIEVE;
        const response = await this.transport.send(this.CLA, this.INS.GET_KEYS, p1, keyType, serializedPath, [ledger_js_1.LedgerError.NoErrors]);
        const payload = (0, ledger_js_1.processResponse)(response);
        return (0, helper_1.processGetKeysResponse)(payload, keyType);
    }
    async sign(path, blob) {
        try {
            const chunks = this.prepareChunks(path, blob);
            let result;
            for (let i = 0; i < chunks.length; i += 1) {
                result = await this.sendGenericChunk(this.INS.SIGN, consts_1.P2_VALUES.DEFAULT, 1, chunks.length, chunks[0]);
            }
            return {
                signature: result.readBytes(result.length()),
            };
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async dkgGetIdentity(index) {
        let req = Buffer.alloc(1);
        req.writeUint8(index);
        const response = await this.transport.send(this.CLA, this.INS.DKG_IDENTITY, 0, 0, req, [ledger_js_1.LedgerError.NoErrors]);
        const data = (0, ledger_js_1.processResponse)(response);
        return (0, helper_1.processGetIdentityResponse)(data);
    }
    async dkgRound1(index, identities, minSigners) {
        try {
            const blob = (0, serialize_1.serializeDkgRound1)(index, identities, minSigners);
            const chunks = this.prepareChunks(DUMMY_PATH, blob);
            let rawResponse;
            for (let i = 0; i < chunks.length; i += 1) {
                rawResponse = await this.sendGenericChunk(this.INS.DKG_ROUND_1, consts_1.P2_VALUES.DEFAULT, 1 + i, chunks.length, chunks[i]);
            }
            let result = await this.getResult(rawResponse);
            return (0, deserialize_1.deserializeDkgRound1)(result);
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async dkgRound2(index, round1PublicPackages, round1SecretPackage) {
        try {
            const blob = (0, serialize_1.serializeDkgRound2)(index, round1PublicPackages, round1SecretPackage);
            const chunks = this.prepareChunks(DUMMY_PATH, blob);
            let rawResponse;
            for (let i = 0; i < chunks.length; i += 1) {
                rawResponse = await this.sendGenericChunk(this.INS.DKG_ROUND_2, consts_1.P2_VALUES.DEFAULT, 1 + i, chunks.length, chunks[i]);
            }
            let result = await this.getResult(rawResponse);
            return (0, deserialize_1.deserializeDkgRound2)(result);
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async dkgRound3Min(index, participants, round1PublicPkgs, round2PublicPkgs, round2SecretPackage, gskBytes) {
        try {
            const blob = (0, serialize_1.serializeDkgRound3Min)(index, participants, round1PublicPkgs, round2PublicPkgs, round2SecretPackage, gskBytes);
            const chunks = this.prepareChunks(DUMMY_PATH, blob);
            for (let i = 0; i < chunks.length; i += 1) {
                await this.sendGenericChunk(this.INS.DKG_ROUND_3_MIN, consts_1.P2_VALUES.DEFAULT, 1 + i, chunks.length, chunks[i]);
            }
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async dkgGetCommitments(tx_hash) {
        try {
            const blob = (0, serialize_1.serializeDkgGetCommitments)(tx_hash);
            const chunks = this.prepareChunks(DUMMY_PATH, blob);
            let rawResponse;
            for (let i = 0; i < chunks.length; i += 1) {
                rawResponse = await this.sendGenericChunk(this.INS.DKG_GET_COMMITMENTS, consts_1.P2_VALUES.DEFAULT, 1 + i, chunks.length, chunks[i]);
            }
            let result = await this.getResult(rawResponse);
            return {
                commitments: result,
            };
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async dkgSign(pkRandomness, frostSigningPackage, txHash) {
        try {
            const blob = (0, serialize_1.serializeDkgSign)(pkRandomness, frostSigningPackage, txHash);
            const chunks = this.prepareChunks(DUMMY_PATH, blob);
            let rawResponse;
            for (let i = 0; i < chunks.length; i += 1) {
                rawResponse = await this.sendGenericChunk(this.INS.DKG_SIGN, consts_1.P2_VALUES.DEFAULT, 1 + i, chunks.length, chunks[i]);
            }
            let result = await this.getResult(rawResponse);
            return {
                signature: result,
            };
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async dkgGetPublicPackage() {
        try {
            let response = await this.transport.send(this.CLA, this.INS.DKG_GET_PUBLIC_PACKAGE, 0, 0, Buffer.alloc(0), [ledger_js_1.LedgerError.NoErrors]);
            let data = (0, ledger_js_1.processResponse)(response);
            let result = await this.getResult(data);
            return {
                publicPackage: result,
            };
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async dkgBackupKeys() {
        try {
            let response = await this.transport.send(this.CLA, this.INS.DKG_BACKUP_KEYS, 0, 0, Buffer.alloc(0), [ledger_js_1.LedgerError.NoErrors]);
            let data = (0, ledger_js_1.processResponse)(response);
            let result = await this.getResult(data);
            return {
                encryptedKeys: result,
            };
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async dkgRetrieveKeys(keyType) {
        const response = await this.transport.send(this.CLA, this.INS.DKG_GET_KEYS, 0, keyType, Buffer.alloc(0), [ledger_js_1.LedgerError.NoErrors]);
        const data = (0, ledger_js_1.processResponse)(response);
        return (0, helper_1.processGetKeysResponse)(data, keyType);
    }
    async dkgRestoreKeys(encryptedKeys) {
        try {
            const chunks = this.prepareChunks(DUMMY_PATH, Buffer.from(encryptedKeys, 'hex'));
            for (let i = 0; i < chunks.length; i += 1) {
                await this.sendGenericChunk(this.INS.DKG_RESTORE_KEYS, consts_1.P2_VALUES.DEFAULT, 1 + i, chunks.length, chunks[i]);
            }
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async reviewTransaction(tx) {
        try {
            const blob = Buffer.from(tx, 'hex');
            const chunks = this.prepareChunks(DUMMY_PATH, blob);
            let rawResponse;
            for (let i = 0; i < chunks.length; i += 1) {
                rawResponse = await this.sendGenericChunk(this.INS.REVIEW_TX, consts_1.P2_VALUES.DEFAULT, 1 + i, chunks.length, chunks[i]);
            }
            let result = await this.getResult(rawResponse);
            return (0, deserialize_1.deserializeReviewTx)(result);
        }
        catch (e) {
            throw (0, ledger_js_1.processErrorResponse)(e);
        }
    }
    async getResult(rawResponse) {
        let data = Buffer.alloc(0);
        let chunks = rawResponse.readBytes(1).readUint8();
        for (let i = 0; i < chunks; i++) {
            let result = await this.transport.send(this.CLA, this.INS.GET_RESULT, i, 0, Buffer.alloc(0));
            let response = (0, ledger_js_1.processResponse)(result);
            data = Buffer.concat([data, response.getCompleteBuffer()]);
        }
        return data;
    }
}
exports.default = IronfishApp;
//# sourceMappingURL=index.js.map