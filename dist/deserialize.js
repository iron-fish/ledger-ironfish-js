"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeReviewTx = exports.deserializeDkgRound2 = exports.deserializeDkgRound1 = void 0;
const consts_1 = require("./consts");
const deserializeDkgRound1 = (data) => {
    if (!data)
        throw new Error('unexpected empty data');
    let pos = 0;
    const secretPackageLen = data.readUint16BE(pos);
    pos += 2;
    const secretPackage = data.subarray(pos, pos + secretPackageLen);
    pos += secretPackageLen;
    const publicPackageLen = data.readUint16BE(pos);
    pos += 2;
    const publicPackage = data.subarray(pos, pos + publicPackageLen);
    pos += publicPackageLen;
    return {
        secretPackage,
        publicPackage,
    };
};
exports.deserializeDkgRound1 = deserializeDkgRound1;
const deserializeDkgRound2 = (data) => {
    if (!data)
        throw new Error('unexpected empty data');
    let pos = 0;
    const secretPackageLen = data.readUint16BE(pos);
    pos += 2;
    const secretPackage = data.subarray(pos, pos + secretPackageLen);
    pos += secretPackageLen;
    const publicPackageLen = data.readUint16BE(pos);
    pos += 2;
    const publicPackage = data.subarray(pos, pos + publicPackageLen);
    pos += publicPackageLen;
    return {
        secretPackage,
        publicPackage,
    };
};
exports.deserializeDkgRound2 = deserializeDkgRound2;
const deserializeReviewTx = (data) => {
    if (!data)
        throw new Error('unexpected empty data');
    // We expect a hash of 32 bytes
    const hash = data.subarray(0, consts_1.TX_HASH_LEN);
    return {
        hash,
    };
};
exports.deserializeReviewTx = deserializeReviewTx;
//# sourceMappingURL=deserialize.js.map