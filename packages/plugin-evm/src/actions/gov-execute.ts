import type { IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
import { WalletProvider } from '../providers/wallet';
import { executeProposalTemplate } from '../templates';
import type { ExecuteProposalParams, SupportedChain, Transaction } from '../types/index';
import governorArtifacts from '../contracts/artifacts/OZGovernor.json';
import {
  type ByteArray,
  type Hex,
  type Address,
  encodeFunctionData,
  keccak256,
  stringToHex,
  getContract,
} from 'viem';

export { executeProposalTemplate };

export class ExecuteAction {
  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
  }

  async execute(params: ExecuteProposalParams): Promise<Transaction> {
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

      const tx = await governorContract.write.execute(
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
        functionName: 'execute',
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
        functionName: 'execute',
        args: [params.targets, params.values, params.calldatas, descriptionHash],
      });

      const txResult = await walletClient.sendTransaction({
        to: params.governor,
        data: encodedData,
        chain: walletClient.chain,
        account: walletClient.account?.address as `0x${string}`,
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

export const executeAction = {
  name: 'execute',
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
        !options.proposalId ||
        !options.targets ||
        !options.values ||
        !options.calldatas ||
        !options.description
      ) {
        throw new Error('Missing required parameters for execute proposal');
      }

      // Convert options to ExecuteProposalParams
      const executeParams: ExecuteProposalParams = {
        chain: options.chain as SupportedChain,
        governor: options.governor as Address,
        proposalId: String(options.proposalId),
        targets: options.targets as Address[],
        values: (options.values as string[]).map((v) => BigInt(v)),
        calldatas: options.calldatas as `0x${string}`[],
        description: String(options.description),
      };

      const privateKey = runtime.getSetting('EVM_PRIVATE_KEY') as `0x${string}`;
      const walletProvider = new WalletProvider(privateKey, runtime);
      const action = new ExecuteAction(walletProvider);
      return await action.execute(executeParams);
    } catch (error) {
      console.error('Error in execute handler:', (error as Error).message);
      if (callback) {
        callback({ text: `Error: ${(error as Error).message}` });
      }
      return false;
    }
  },
  template: executeProposalTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting('EVM_PRIVATE_KEY');
    return typeof privateKey === 'string' && privateKey.startsWith('0x');
  },
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Execute proposal 123 on the governor at 0x1234567890123456789012345678901234567890 on Ethereum',
          action: 'EXECUTE_PROPOSAL',
        },
      },
    ],
  ],
  similes: ['EXECUTE_PROPOSAL', 'GOVERNANCE_EXECUTE'],
}; // TODO: add more examples
