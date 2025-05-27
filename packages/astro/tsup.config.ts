import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/vemetric.ts'],
  splitting: false,
  clean: true,
  dts: true,
  minify: true,
  format: ['cjs', 'esm'],
});
