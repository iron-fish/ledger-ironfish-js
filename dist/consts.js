"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TX_HASH_LEN = exports.IDENTITY_LEN = exports.ED25519_SIGNATURE_LEN = exports.REDJUBJUB_SIGNATURE_LEN = exports.KEY_LENGTH = exports.VERSION = exports.KEY_TYPES = exports.P2_VALUES = exports.APP_KEY = void 0;
exports.APP_KEY = 'Ironfish';
exports.P2_VALUES = {
    DEFAULT: 0x00,
};
exports.KEY_TYPES = {
    PUBLIC_ADRESS: 0x00,
    VIEW_KEY: 0x01,
    PROOF_GEN_KEY: 0x02,
};
exports.VERSION = 1;
exports.KEY_LENGTH = 32;
exports.REDJUBJUB_SIGNATURE_LEN = 64;
exports.ED25519_SIGNATURE_LEN = 64;
exports.IDENTITY_LEN = exports.VERSION + exports.KEY_LENGTH + exports.KEY_LENGTH + exports.ED25519_SIGNATURE_LEN;
exports.TX_HASH_LEN = 32;
//# sourceMappingURL=consts.js.map