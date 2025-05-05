import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/main.ts'],
  splitting: false,
  clean: true,
  dts: true,
  minify: true,
  format: ['cjs', 'esm'],
});
