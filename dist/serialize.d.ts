export declare const serializeDkgRound1: (index: number, identities: string[], minSigners: number) => Buffer;
export declare const serializeDkgRound2: (index: number, round1PublicPackages: string[], round1SecretPackage: string) => Buffer;
export declare const serializeDkgRound3Min: (index: number, participants: string[], round1PublicPkgs: string[], round2PublicPkgs: string[], round2SecretPackage: string, gskBytes: string[]) => Buffer;
export declare const serializeDkgGetCommitments: (tx_hash: string) => Buffer;
export declare const serializeDkgSign: (pkRandomness: string, frostSigningPackage: string, txHash: string) => Buffer;
