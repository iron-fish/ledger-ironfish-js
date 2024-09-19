import { ResponsePayload } from '@zondax/ledger-js/dist/payload';
import { IronfishKeys, KeyResponse, ResponseIdentity } from './types';
export declare function processGetKeysResponse(response: ResponsePayload, keyType: IronfishKeys): KeyResponse;
export declare function processGetIdentityResponse(response: ResponsePayload): ResponseIdentity;
