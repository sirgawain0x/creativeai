import { Service, IAgentRuntime } from '@elizaos/core';
import { EVMWalletProvider } from './providers/wallet';
import { EVMWalletData } from './types';
import { EVM_SERVICE_NAME, EVM_WALLET_DATA_CACHE_KEY } from './constants';
import * as chains from 'viem/chains';
import { PublicClient } from 'viem';

type SupportedChain = keyof typeof chains;

export class EVMService extends Service {
  static serviceType: string = EVM_SERVICE_NAME;
  capabilityDescription = 'EVM blockchain wallet access';

  private walletProvider: EVMWalletProvider;
  private lastRefreshTimestamp = 0;

  constructor(runtime: IAgentRuntime) {
    super();
    this.runtime = runtime;
    this.walletProvider = new EVMWalletProvider(runtime);
  }

  async initialize(): Promise<void> {
    await this.walletProvider.initializeWallet(this.runtime);
    const walletData = await this.refreshWalletData();
    if (!walletData) {
      throw new Error('Failed to initialize wallet data');
    }
  }

  async stop(): Promise<void> {
    // Cleanup if needed
  }

  getWalletClient(chainName: SupportedChain) {
    return this.walletProvider.getWalletClient(chainName);
  }

  getPublicClient(chainName: SupportedChain): PublicClient {
    return this.walletProvider.getPublicClient(chainName);
  }

  getChainConfig(chainName: SupportedChain) {
    return this.walletProvider.getChainConfigs(chainName);
  }

  async getWalletData(): Promise<EVMWalletData | null> {
    const data = await this.runtime.getCache<EVMWalletData>(EVM_WALLET_DATA_CACHE_KEY);
    if (!data) {
      return null;
    }
    return data;
  }

  async refreshWalletData(): Promise<EVMWalletData | null> {
    try {
      const address = this.walletProvider.getAddress();
      if (!address) {
        return null;
      }

      const chains = (this.runtime.character?.settings?.chains?.evm as string[]) || [];
      if (!chains.length) {
        return null;
      }

      const timestamp = Date.now();

      const walletData: EVMWalletData = {
        address,
        chains,
        timestamp,
      };

      const success = await this.runtime.setCache<EVMWalletData>(
        EVM_WALLET_DATA_CACHE_KEY,
        walletData
      );
      if (success) {
        this.lastRefreshTimestamp = timestamp;
        return walletData;
      }
      return null;
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
      return null;
    }
  }

  async getCachedData(): Promise<EVMWalletData | null> {
    const data = await this.getWalletData();
    if (!data) {
      return this.refreshWalletData();
    }
    return data;
  }
}
