import type { HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { composePrompt, ModelType } from '@elizaos/core';
import { type ExtendedChain, createConfig, executeRoute, getRoutes } from '@lifi/sdk';

import { parseEther } from 'viem';
import { type WalletProvider, initWalletProvider } from '../providers/wallet';
import { bridgeTemplate } from '../templates';
import type { BridgeParams, Transaction } from '../types/index';

export { bridgeTemplate };

export class BridgeAction {
  private config;

  constructor(private walletProvider: WalletProvider) {
    this.config = createConfig({
      integrator: 'eliza',
      chains: Object.values(this.walletProvider.chains).map((config) => ({
        id: config.id,
        name: config.name,
        key: config.name.toLowerCase(),
        chainType: 'EVM',
        nativeToken: {
          ...config.nativeCurrency,
          chainId: config.id,
          address: '0x0000000000000000000000000000000000000000',
          coinKey: config.nativeCurrency.symbol,
        },
        metamask: {
          chainId: `0x${config.id.toString(16)}`,
          chainName: config.name,
          nativeCurrency: config.nativeCurrency,
          rpcUrls: [config.rpcUrls.default.http[0]],
          blockExplorerUrls: config.blockExplorers?.default?.url
            ? [config.blockExplorers.default.url]
            : [],
        },
        diamondAddress: '0x0000000000000000000000000000000000000000',
        coin: config.nativeCurrency.symbol,
        mainnet: true,
      })) as ExtendedChain[],
    });
  }

  async bridge(params: BridgeParams): Promise<Transaction> {
    const walletClient = this.walletProvider.getWalletClient(params.fromChain);
    const [fromAddress] = await walletClient.getAddresses();

    const routes = await getRoutes({
      fromChainId: this.walletProvider.getChainConfigs(params.fromChain).id,
      toChainId: this.walletProvider.getChainConfigs(params.toChain).id,
      fromTokenAddress: params.fromToken,
      toTokenAddress: params.toToken,
      fromAmount: parseEther(params.amount).toString(),
      fromAddress: fromAddress,
      toAddress: params.toAddress || fromAddress,
    });

    if (!routes.routes.length) throw new Error('No routes found');

    const execution = await executeRoute(routes.routes[0], {
      ...this.config,
      infiniteApproval: false,
    });
    const process = execution.steps[0]?.execution?.process[0];

    if (!process?.status || process.status === 'FAILED') {
      throw new Error('Transaction failed');
    }

    return {
      hash: process.txHash as `0x${string}`,
      from: fromAddress,
      to: routes.routes[0].steps[0].estimate.approvalAddress as `0x${string}`,
      value: BigInt(params.amount),
      chainId: this.walletProvider.getChainConfigs(params.fromChain).id,
    };
  }
}

const buildBridgeDetails = async (
  state: State,
  runtime: IAgentRuntime,
  wp: WalletProvider
): Promise<BridgeParams> => {
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

  // Compose bridge context
  const bridgeContext = composePrompt({
    state,
    template: bridgeTemplate,
  });

  const content = await runtime.useModel(ModelType.OBJECT_LARGE, {
    context: bridgeContext,
  });

  // Validate chains exist
  const fromChain = content.fromChain;
  const toChain = content.toChain;

  if (!wp.chains[fromChain]) {
    throw new Error(
      `Source chain ${fromChain} not configured. Available chains: ${chains.join(', ')}`
    );
  }

  if (!wp.chains[toChain]) {
    throw new Error(
      `Destination chain ${toChain} not configured. Available chains: ${chains.join(', ')}`
    );
  }

  return {
    fromChain,
    toChain,
    fromToken: content.fromToken,
    toToken: content.toToken,
    amount: content.amount,
    toAddress: content.toAddress,
  };
};
