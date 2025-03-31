import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/index.ts', 'src/commands/*.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: false,
  external: [
    '@electric-sql/pglite',
    'zod',
    '@elizaos/core',
    '@elizaos/plugin-anthropic',
    '@elizaos/plugin-openai',
    '@elizaos/plugin-sql',
    '@noble/curves',
    'axios',
    'body-parser',
    'commander',
    'cors',
    'diff',
    'dotenv',
    'execa',
    'express',
    'fs-extra',
    'glob',
    'handlebars',
    'https-proxy-agent',
    'inquirer',
    'multer',
    'prompts',
    'socket.io',
    'yoctocolors',
    'rimraf',
    '@octokit/rest',
    'semver',
    'uuid',
  ],
  noExternal: [],
  platform: 'node',
  minify: false,
  target: 'esnext',
  outDir: 'dist',
  tsconfig: 'tsconfig.json',
  banner: {
    js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
  },
  esbuildOptions(options) {
    options.alias = {
      '@/src': './src',
    };
  },
});
