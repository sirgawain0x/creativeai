import type { IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
import { WalletProvider } from '../providers/wallet';
import { proposeTemplate } from '../templates';
import type { ProposeProposalParams, SupportedChain, Transaction } from '../types/index';
import governorArtifacts from '../contracts/artifacts/OZGovernor.json';
import { type ByteArray, type Hex, encodeFunctionData, type Address } from 'viem';
import { getContract } from 'viem';

export { proposeTemplate };

export class ProposeAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async propose(params: ProposeProposalParams): Promise<Transaction> {
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
      const tx = await governorContract.write.propose(
        [params.targets, params.values, params.calldatas, params.description],
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
        functionName: 'propose',
        args: [params.targets, params.values, params.calldatas, params.description],
        account: walletClient.account.address,
        chain: publicClient.chain,
      });

      if (!simulatedTx.request) {
        throw new Error('Failed to simulate transaction');
      }

      const gasEstimate = simulatedTx.request.gas;

      const encodedData = encodeFunctionData({
        abi: governorArtifacts.abi,
        functionName: 'propose',
        args: [params.targets, params.values, params.calldatas, params.description],
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

export const proposeAction = {
  name: 'propose',
  description: 'Execute a DAO governance proposal',
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
        throw new Error('Missing required parameters for proposal');
      }

      // Convert options to ProposeProposalParams
      const proposeParams: ProposeProposalParams = {
        chain: options.chain as SupportedChain,
        governor: options.governor as Address,
        targets: options.targets as Address[],
        values: (options.values as string[]).map((v) => BigInt(v)),
        calldatas: options.calldatas as `0x${string}`[],
        description: String(options.description),
      };

      const privateKey = runtime.getSetting('EVM_PRIVATE_KEY') as `0x${string}`;
      const walletProvider = new WalletProvider(privateKey, runtime);
      const action = new ProposeAction(walletProvider);
      return await action.propose(proposeParams);
    } catch (error) {
      console.error('Error in propose handler:', (error as Error).message);
      if (callback) {
        callback({ text: `Error: ${(error as Error).message}` });
      }
      return false;
    }
  },
  template: proposeTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting('EVM_PRIVATE_KEY');
    return typeof privateKey === 'string' && privateKey.startsWith('0x');
  },
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Propose transferring 1e18 tokens on the governor at 0x1234567890123456789012345678901234567890 on Ethereum',
          action: 'PROPOSE',
        },
      },
    ],
  ],
  similes: ['PROPOSE', 'GOVERNANCE_PROPOSE'],
}; // TODO: add more examples
