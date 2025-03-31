import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: [
    '@elizaos/core',
    'dotenv',
    'fs',
    'path',
    'os',
    'crypto',
    'ethers',
    'viem',
    '@lifi/sdk',
    '@wagmi/core',
    'zod',
  ],
});
