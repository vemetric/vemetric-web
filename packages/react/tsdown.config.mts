import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.tsx'],
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
});
