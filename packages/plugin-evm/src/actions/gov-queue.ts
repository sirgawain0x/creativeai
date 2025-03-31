import type { IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
import { WalletProvider } from '../providers/wallet';
import { queueProposalTemplate } from '../templates';
import type { QueueProposalParams, SupportedChain, Transaction } from '../types/index';
import governorArtifacts from '../contracts/artifacts/OZGovernor.json';
import {
  type ByteArray,
  type Hex,
  encodeFunctionData,
  keccak256,
  stringToHex,
  type Address,
  getContract,
} from 'viem';

export { queueProposalTemplate };

export class QueueAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async queue(params: QueueProposalParams): Promise<Transaction> {
    const walletClient = this.walletProvider.getWalletClient(params.chain);
    if (!walletClient.account) {
      throw new Error('No wallet account found');
    }

    const publicClient = this.walletProvider.getPublicClient(params.chain);
    const governorContract = getContract({
      address: params.governor as `0x${string}`,
      abi: governorArtifacts.abi,
      publicClient,
      walletClient,
    });

    try {
      // Compute description hash
      const descriptionHash = keccak256(stringToHex(params.description));

      const tx = await governorContract.write.queue(
        [params.targets, params.values, params.calldatas, descriptionHash],
        {
          account: walletClient.account,
          chain: publicClient.chain,
        }
      );

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      const txHash = receipt.transactionHash;

      const simulatedTx = await publicClient.simulateContract({
        address: params.governor as `0x${string}`,
        abi: governorArtifacts.abi,
        functionName: 'queue',
        args: [params.targets, params.values, params.calldatas, descriptionHash],
        account: walletClient.account.address,
        chain: publicClient.chain,
      });

      if (!simulatedTx.request) {
        throw new Error('Failed to simulate transaction');
      }

      const gasEstimate = simulatedTx.request.gas;

      const encodedData = encodeFunctionData({
        abi: governorArtifacts.abi,
        functionName: 'queue',
        args: [params.targets, params.values, params.calldatas, descriptionHash],
      });

      await walletClient.sendTransaction({
        to: params.governor as `0x${string}`,
        data: encodedData,
        value: BigInt(0),
        gas: gasEstimate,
        account: walletClient.account.address,
        chain: null,
      });

      return {
        hash: txHash,
        from: walletClient.account.address,
        to: params.governor,
        value: BigInt(0),
        data: encodedData,
        chainId: this.walletProvider.getChainConfigs(params.chain).id,
        logs: receipt.logs,
      };
    } catch (error) {
      throw new Error(`Vote failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const queueAction = {
  name: 'queue',
  description: 'Queue a DAO governance proposal for execution',
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    options: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    try {
      // Validate required fields
      if (
        !options.chain ||
        !options.governor ||
        !options.targets ||
        !options.values ||
        !options.calldatas ||
        !options.description
      ) {
        throw new Error('Missing required parameters for queue proposal');
      }

      // Convert options to QueueProposalParams
      const queueParams: QueueProposalParams = {
        chain: options.chain as SupportedChain,
        governor: options.governor as Address,
        targets: options.targets as Address[],
        values: (options.values as string[]).map((v) => BigInt(v)),
        calldatas: options.calldatas as `0x${string}`[],
        description: String(options.description),
      };

      const privateKey = runtime.getSetting('EVM_PRIVATE_KEY') as `0x${string}`;
      const walletProvider = new WalletProvider(privateKey, runtime);
      const action = new QueueAction(walletProvider);
      return await action.queue(queueParams);
    } catch (error) {
      console.error('Error in queue handler:', (error as Error).message);
      if (callback) {
        callback({ text: `Error: ${(error as Error).message}` });
      }
      return false;
    }
  },
  template: queueProposalTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting('EVM_PRIVATE_KEY');
    return typeof privateKey === 'string' && privateKey.startsWith('0x');
  },
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Queue proposal 123 on the governor at 0x1234567890123456789012345678901234567890 on Ethereum',
          action: 'QUEUE_PROPOSAL',
        },
      },
    ],
  ],
  similes: ['QUEUE_PROPOSAL', 'GOVERNANCE_QUEUE'],
}; // TODO: add more examples
