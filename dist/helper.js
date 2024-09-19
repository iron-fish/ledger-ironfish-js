"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGetKeysResponse = processGetKeysResponse;
exports.processGetIdentityResponse = processGetIdentityResponse;
const consts_1 = require("./consts");
const types_1 = require("./types");
function processGetKeysResponse(response, keyType) {
    switch (keyType) {
        case types_1.IronfishKeys.PublicAddress: {
            const publicAddress = response.readBytes(consts_1.KEY_LENGTH);
            return {
                publicAddress,
            };
        }
        case types_1.IronfishKeys.ViewKey: {
            const viewKey = response.readBytes(2 * consts_1.KEY_LENGTH);
            const ivk = response.readBytes(consts_1.KEY_LENGTH);
            const ovk = response.readBytes(consts_1.KEY_LENGTH);
            return {
                viewKey,
                ivk,
                ovk,
            };
        }
        case types_1.IronfishKeys.ProofGenerationKey: {
            const ak = response.readBytes(consts_1.KEY_LENGTH);
            const nsk = response.readBytes(consts_1.KEY_LENGTH);
            return {
                ak,
                nsk,
            };
        }
    }
}
function processGetIdentityResponse(response) {
    const identity = response.readBytes(consts_1.IDENTITY_LEN);
    return { identity };
}
//# sourceMappingURL=helper.js.map