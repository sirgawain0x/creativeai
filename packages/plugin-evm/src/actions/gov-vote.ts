import type { IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
import { WalletProvider } from '../providers/wallet';
import { voteTemplate } from '../templates';
import type { VoteParams, SupportedChain, Transaction } from '../types/index';
import governorArtifacts from '../contracts/artifacts/OZGovernor.json';
import { type ByteArray, type Hex, encodeFunctionData, type Address, getContract } from 'viem';

export { voteTemplate };

export class VoteAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async vote(params: VoteParams): Promise<Transaction> {
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
      const tx = await governorContract.write.castVote([params.proposalId, params.support], {
        account: walletClient.account,
        chain: publicClient.chain,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      const txHash = receipt.transactionHash;

      const simulatedTx = await publicClient.simulateContract({
        address: params.governor as `0x${string}`,
        abi: governorArtifacts.abi,
        functionName: 'castVote',
        args: [params.proposalId, params.support],
        account: walletClient.account.address,
        chain: publicClient.chain,
      });

      if (!simulatedTx.request) {
        throw new Error('Failed to simulate transaction');
      }

      const gasEstimate = simulatedTx.request.gas;

      const encodedData = encodeFunctionData({
        abi: governorArtifacts.abi,
        functionName: 'castVote',
        args: [params.proposalId, params.support],
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

export const voteAction = {
  name: 'vote',
  description: 'Vote on a DAO governance proposal',
  handler: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State,
    options: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    try {
      // Validate required fields
      if (!options.chain || !options.governor || !options.proposalId || !options.support) {
        throw new Error('Missing required parameters for vote');
      }

      // Convert options to VoteParams
      const voteParams: VoteParams = {
        chain: options.chain as SupportedChain,
        governor: options.governor as Address,
        proposalId: String(options.proposalId),
        support: Number(options.support),
      };

      const privateKey = runtime.getSetting('EVM_PRIVATE_KEY') as `0x${string}`;
      const walletProvider = new WalletProvider(privateKey, runtime);
      const action = new VoteAction(walletProvider);
      return await action.vote(voteParams);
    } catch (error) {
      console.error('Error in vote handler:', (error as Error).message);
      if (callback) {
        callback({ text: `Error: ${(error as Error).message}` });
      }
      return false;
    }
  },
  template: voteTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting('EVM_PRIVATE_KEY');
    return typeof privateKey === 'string' && privateKey.startsWith('0x');
  },
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Vote in favor of proposal 123 on the governor at 0x1234567890123456789012345678901234567890 on Ethereum',
          action: 'VOTE',
        },
      },
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Vote no on proposal 456 on the governor at 0xabcdef1111111111111111111111111111111111 on Ethereum',
          action: 'GOVERNANCE_VOTE',
        },
      },
    ],
    [
      {
        user: 'user',
        content: {
          text: 'Abstain from voting on proposal 789 on the governor at 0x0000111122223333444455556666777788889999 on Ethereum',
          action: 'GOVERNANCE_VOTE',
        },
      },
    ],
  ],
  similes: ['VOTE', 'GOVERNANCE_VOTE'],
}; // TODO: add more examples
