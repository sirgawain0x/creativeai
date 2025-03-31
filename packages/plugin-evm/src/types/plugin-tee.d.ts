declare module '@elizaos/plugin-tee' {
  export enum TEEMode {
    OFF = 'off',
    WALLET = 'wallet',
  }

  export class DeriveKeyProvider {
    constructor(mode: TEEMode);
    deriveKey(params: { mode: TEEMode; keyId: string }): Promise<string>;
    deriveEcdsaKeypair(salt: string, keyId: string, agentId: string): Promise<{ keypair: string }>;
  }
}
