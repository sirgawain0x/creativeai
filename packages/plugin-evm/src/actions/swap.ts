import type { IAgentRuntime, Memory, State } from '@elizaos/core';
import { ModelType, composePrompt, elizaLogger } from '@elizaos/core';
import { type ExtendedChain, type Route, createConfig, executeRoute, getRoutes } from '@lifi/sdk';

import {
  type Address,
  type ByteArray,
  type Hex,
  encodeFunctionData,
  parseAbi,
  parseUnits,
} from 'viem';
import { WalletProvider, initWalletProvider } from '../providers/wallet';
import { swapTemplate } from '../templates';
import type { SwapParams, SwapQuote, Transaction } from '../types/index';
import type { BebopRoute } from '../types/index';

export { swapTemplate };

export class SwapAction {
  private lifiConfig;
  private bebopChainsMap;

  constructor(private walletProvider: WalletProvider) {
    this.walletProvider = walletProvider;
    const lifiChains: ExtendedChain[] = [];
    for (const config of Object.values(this.walletProvider.chains)) {
      try {
        const blockExplorerUrl = config.blockExplorers?.default?.url || '';
        lifiChains.push({
          id: config.id,
          name: config.name,
          key: config.name.toLowerCase(),
          chainType: 'EVM' as const,
          nativeToken: {
            ...config.nativeCurrency,
            chainId: config.id,
            address: '0x0000000000000000000000000000000000000000',
            coinKey: config.nativeCurrency.symbol,
            priceUSD: '0',
            logoURI: '',
            symbol: config.nativeCurrency.symbol,
            decimals: config.nativeCurrency.decimals,
            name: config.nativeCurrency.name,
          },
          rpcUrls: {
            public: { http: [config.rpcUrls.default.http[0]] },
          },
          blockExplorerUrls: blockExplorerUrl ? [blockExplorerUrl] : [],
          metamask: {
            chainId: `0x${config.id.toString(16)}`,
            chainName: config.name,
            nativeCurrency: config.nativeCurrency,
            rpcUrls: [config.rpcUrls.default.http[0]],
            blockExplorerUrls: blockExplorerUrl ? [blockExplorerUrl] : [],
          },
          coin: config.nativeCurrency.symbol,
          mainnet: true,
          diamondAddress: '0x0000000000000000000000000000000000000000',
        } as ExtendedChain);
      } catch (error) {
        // Skip chains with missing config in viem
        elizaLogger.error(`Error configuring chain ${config.name}:`, (error as Error).message);
      }
    }
    this.lifiConfig = createConfig({
      integrator: 'eliza',
      chains: lifiChains,
    });
    this.bebopChainsMap = {
      mainnet: 'ethereum',
      optimism: 'optimism',
      polygon: 'polygon',
      arbitrum: 'arbitrum',
      base: 'base',
      linea: 'linea',
    };
  }

  async swap(params: SwapParams): Promise<Transaction> {
    const walletClient = this.walletProvider.getWalletClient(params.chain);
    const [fromAddress] = await walletClient.getAddresses();

    // Getting quotes from different aggregators and sorting them by minAmount (amount after slippage)
    const decimalsAbi = parseAbi(['function decimals() view returns (uint8)']);
    const decimals = await this.walletProvider.getPublicClient(params.chain).readContract({
      address: params.fromToken,
      abi: decimalsAbi,
      functionName: 'decimals',
    });

    const quotes = await Promise.all([
      this.getLifiQuote(fromAddress, params, decimals),
      this.getBebopQuote(fromAddress, params, decimals),
    ]);

    const sortedQuotes = quotes.filter((quote): quote is SwapQuote => quote !== undefined);
    sortedQuotes.sort((a, b) => (BigInt(a.minOutputAmount) > BigInt(b.minOutputAmount) ? -1 : 1));
    if (sortedQuotes.length === 0) throw new Error('No routes found');

    // Trying to execute the best quote by amount, fallback to the next one if it fails
    for (const quote of sortedQuotes) {
      let res;
      switch (quote.aggregator) {
        case 'lifi':
          res = await this.executeLifiQuote(quote);
          break;
        case 'bebop':
          res = await this.executeBebopQuote(quote, params);
          break;
        default:
          throw new Error('No aggregator found');
      }
      if (res !== undefined) return res;
    }
    throw new Error('Execution failed');
  }

  private async getSortedQuotes(fromAddress: Address, params: SwapParams): Promise<SwapQuote[]> {
    const decimalsAbi = parseAbi(['function decimals() view returns (uint8)']);
    const decimals = await this.walletProvider.getPublicClient(params.chain).readContract({
      address: params.fromToken,
      abi: decimalsAbi,
      functionName: 'decimals',
    });
    const quotes = await Promise.all([
      this.getLifiQuote(fromAddress, params, decimals),
      this.getBebopQuote(fromAddress, params, decimals),
    ]);

    const sortedQuotes = quotes.filter((quote): quote is SwapQuote => quote !== undefined);
    sortedQuotes.sort((a, b) => (BigInt(a.minOutputAmount) > BigInt(b.minOutputAmount) ? -1 : 1));
    if (sortedQuotes.length === 0) throw new Error('No routes found');
    return sortedQuotes;
  }

  private async getLifiQuote(
    fromAddress: Address,
    params: SwapParams,
    fromTokenDecimals: number
  ): Promise<SwapQuote | undefined> {
    try {
      const routes = await getRoutes({
        fromChainId: this.walletProvider.getChainConfigs(params.chain).id,
        toChainId: this.walletProvider.getChainConfigs(params.chain).id,
        fromTokenAddress: params.fromToken,
        toTokenAddress: params.toToken,
        fromAmount: parseUnits(params.amount, fromTokenDecimals).toString(),
        fromAddress: fromAddress,
        options: {
          slippage: (params.slippage ?? 0.5) / 100,
          order: 'RECOMMENDED',
        },
      });
      if (!routes.routes.length) throw new Error('No routes found');
      return {
        aggregator: 'lifi',
        minOutputAmount: routes.routes[0].steps[0].estimate.toAmountMin,
        swapData: routes.routes[0],
      };
    } catch (error) {
      elizaLogger.error('Error in getLifiQuote:', (error as Error).message);
      return undefined;
    }
  }

  private async getBebopQuote(
    fromAddress: Address,
    params: SwapParams,
    fromTokenDecimals: number
  ): Promise<SwapQuote | undefined> {
    try {
      const reqParams = new URLSearchParams();
      reqParams.append('sell_tokens', params.fromToken);
      reqParams.append('buy_tokens', params.toToken);
      reqParams.append('sell_amount', params.amount);
      reqParams.append('slippage', (params.slippage ?? 0.5).toString());
      reqParams.append('source', 'eliza');

      const chainName =
        this.bebopChainsMap[params.chain as keyof typeof this.bebopChainsMap] ?? params.chain;
      const url = `https://api.bebop.xyz/router/${chainName}/v1/quote?${reqParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const data = (await response.json()) as {
        routes: [
          {
            quote: {
              tx: {
                data: string;
                from: string;
                to: string;
                value: string;
                gas: string;
                gasPrice: string;
              };
              approvalTarget: string;
              buyTokens: {
                [key: string]: {
                  minimumAmount: string;
                };
              };
            };
          },
        ];
      };

      const route: BebopRoute = {
        data: data.routes[0].quote.tx.data,
        sellAmount: parseUnits(params.amount, fromTokenDecimals).toString(),
        approvalTarget: data.routes[0].quote.approvalTarget as `0x${string}`,
        from: data.routes[0].quote.tx.from as `0x${string}`,
        value: data.routes[0].quote.tx.value.toString(),
        to: data.routes[0].quote.tx.to as `0x${string}`,
        gas: data.routes[0].quote.tx.gas.toString(),
        gasPrice: data.routes[0].quote.tx.gasPrice.toString(),
      };
      return {
        aggregator: 'bebop',
        minOutputAmount: data.routes[0].quote.buyTokens[params.toToken].minimumAmount.toString(),
        swapData: route,
      };
    } catch (error) {
      elizaLogger.error('Error in getBebopQuote:', (error as Error).message);
      return undefined;
    }
  }

  private async executeLifiQuote(quote: SwapQuote): Promise<Transaction | undefined> {
    try {
      const route = quote.swapData as Route;
      const execution = await executeRoute(route);
      const process = execution.steps[0]?.execution?.process[0];

      if (!process?.status || process.status === 'FAILED') {
        throw new Error('Transaction failed');
      }

      const txHash = process.transactionHash;
      const receipt = await this.walletProvider
        .getPublicClient(route.fromChainId.toString())
        .waitForTransactionReceipt({ hash: txHash });

      return {
        hash: txHash,
        from: receipt.from,
        to: receipt.to as Address,
        value: receipt.effectiveGasPrice ? BigInt(receipt.effectiveGasPrice) : BigInt(0),
        data: '0x' as `0x${string}`,
        chainId: route.fromChainId,
        logs: receipt.logs,
      };
    } catch (error) {
      elizaLogger.error('Error in executeLifiQuote:', (error as Error).message);
      return undefined;
    }
  }

  private async executeBebopQuote(
    quote: SwapQuote,
    params: SwapParams
  ): Promise<Transaction | undefined> {
    try {
      const route = quote.swapData as BebopRoute;
      const walletClient = this.walletProvider.getWalletClient(params.chain);
      if (!walletClient.account) {
        throw new Error('No wallet account found');
      }

      const tx = await walletClient.sendTransaction({
        to: route.to,
        data: route.data as Hex,
        value: BigInt(route.value),
        gas: BigInt(route.gas),
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
        value: receipt.effectiveGasPrice ? BigInt(receipt.effectiveGasPrice) : BigInt(0),
        data: '0x' as `0x${string}`,
        chainId: this.walletProvider.getChainConfigs(params.chain).id,
        logs: receipt.logs,
      };
    } catch (error) {
      elizaLogger.error('Error in executeBebopQuote:', (error as Error).message);
      return undefined;
    }
  }
}

const buildSwapDetails = async (
  state: State,
  runtime: IAgentRuntime,
  wp: WalletProvider
): Promise<SwapParams> => {
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
    template: swapTemplate,
  });

  const swapDetails = await runtime.useModel(ModelType.OBJECT_SMALL, {
    context,
  });

  // Validate chain exists
  const chain = swapDetails.chain;
  if (!wp.chains[chain]) {
    throw new Error(`Chain ${chain} not configured. Available chains: ${chains.join(', ')}`);
  }

  return swapDetails;
};

export const swapAction = {
  name: 'swap',
  description: 'Swap tokens on a DEX',
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: any,
    callback?: (response: { text: string }) => void
  ) => {
    try {
      const privateKey = runtime.getSetting('EVM_PRIVATE_KEY') as `0x${string}`;
      const wp = new WalletProvider(privateKey, runtime);
      const swapParams = await buildSwapDetails(state, runtime, wp);
      const action = new SwapAction(wp);
      const tx = await action.swap(swapParams);
      if (callback) {
        callback({
          text: `Successfully swapped ${swapParams.amount} ${swapParams.fromToken} for ${swapParams.toToken}. Transaction hash: ${tx.hash}`,
        });
      }
      return true;
    } catch (error) {
      if (callback) {
        callback({
          text: `Error: ${(error as Error).message}`,
        });
      }
      return false;
    }
  },
  template: swapTemplate,
  validate: async (runtime: IAgentRuntime) => {
    const privateKey = runtime.getSetting('EVM_PRIVATE_KEY');
    return typeof privateKey === 'string' && privateKey.startsWith('0x');
  },
  examples: [
    [
      {
        user: 'user',
        content: {
          text: 'Swap 1 ETH for USDC on Ethereum',
          action: 'SWAP',
        },
      },
    ],
  ],
  similes: ['SWAP', 'EXCHANGE', 'TRADE'],
};
