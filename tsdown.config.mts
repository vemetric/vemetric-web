import { defineConfig, type UserConfig } from 'tsdown';

const baseConfig: UserConfig = {
  format: ['cjs', 'esm'],
  platform: 'browser',
  target: 'es2018',
  dts: { sourcemap: false },
  sourcemap: false,
  minify: true,
  // emit "use strict" in the CJS output, as the ESM source is always strict
  outputOptions: { strict: true },
  // keep the file names of the previous tsup build (index.js / index.mjs / index.d.ts / index.d.mts)
  outExtensions: ({ format }) => (format === 'cjs' ? { js: '.js', dts: '.d.ts' } : { js: '.mjs', dts: '.d.mts' }),
};

// each entry is built separately so that no shared chunks are created, as main.js is used standalone for the CDN script
export default defineConfig([
  { ...baseConfig, entry: ['src/index.ts'] },
  { ...baseConfig, entry: ['src/main.ts'], clean: false },
]);
