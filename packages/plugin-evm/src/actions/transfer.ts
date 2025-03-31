import {
  type Action,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type State,
  composePrompt,
} from '@elizaos/core';
import { type ByteArray, type Hex, type Address, formatEther, parseEther } from 'viem';

import { WalletProvider, initWalletProvider } from '../providers/wallet';
import { transferTemplate } from '../templates';
import type { Transaction, TransferParams } from '../types/index';

// Exported for tests
export class TransferAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async transfer(params: TransferParams): Promise<Transaction> {
    const walletClient = this.walletProvider.getWalletClient(params.chain);
    if (!walletClient.account) {
      throw new Error('No wallet account found');
    }

    try {
      const tx = await walletClient.sendTransaction({
        to: params.to,
        value: BigInt(params.amount),
        account: walletClient.account.address,
        chain: null,
      });

      const receipt = await this.walletProvider
        .getPublicClient(params.chain)
        .waitForTransactionReceipt({ hash: tx });

      return {
        hash: tx,
        from: receipt.from,
        to: receipt.to as Address,
        value: BigInt(params.amount),
        data: '0x' as `0x${string}`,
        chainId: this.walletProvider.getChainConfigs(params.chain).id,
        logs: receipt.logs,
      };
    } catch (error) {
      throw new Error(
        `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

const buildTransferDetails = async (
  state: State,
  runtime: IAgentRuntime,
  wp: WalletProvider
): Promise<TransferParams> => {
  const chains = wp.getSupportedChains();
  state.supportedChains = chains.map((item) => `"${item}"`).join('|');

  // Add balances to state for better context in template
  const balances = await wp.getWalletBalances();
  state.chainBalances = Object.entries(balances)
    .map(([chain, balance]) => {
      const chainConfig = wp.getChainConfigs(chain as any);
      return `${chain}: ${balance} ${chainConfig.nativeCurrency.symbol}`;
    })
    .join(', ');

  const context = composePrompt({
    state,
    template: transferTemplate,
  });

  const transferDetails = await runtime.useModel(ModelType.OBJECT_SMALL, {
    context,
  });

  const existingChain = wp.chains[transferDetails.fromChain];

  if (!existingChain) {
    throw new Error(
      'The chain ' +
        transferDetails.fromChain +
        ' not configured yet. Add the chain or choose one from configured: ' +
        chains.toString()
    );
  }

  return transferDetails;
};

export const transferAction = {
  name: 'transfer',
  description: 'Transfer native tokens to an address',
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback?: HandlerCallback
  ) => {
    try {
      const privateKey = runtime.getSetting('EVM_PRIVATE_KEY') as `0x${string}`;
      const wp = new WalletProvider(privateKey, runtime);
      // Get transfer parameters
      const transferParams = await buildTransferDetails(state, runtime, wp);
      const action = new TransferAction(wp);
      const tx = await action.transfer(transferParams);

      if (callback) {
        callback({
          text: `Successfully transferred ${transferParams.amount} native tokens to ${transferParams.to} on ${transferParams.chain}. Transaction hash: ${tx.hash}`,
        });
      }
      return true;
    } catch (error) {
      if (callback) {
        callback({
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
      return false;
    }
  },
  template: transferTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting('EVM_PRIVATE_KEY');
    return typeof privateKey === 'string' && privateKey.startsWith('0x');
  },
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Transfer 1 ETH to 0x1234567890123456789012345678901234567890 on Ethereum',
          action: 'TRANSFER',
        },
      },
    ],
  ],
  similes: ['TRANSFER', 'SEND'],
};
