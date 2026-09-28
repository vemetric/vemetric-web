import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['dist/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  prettier,
);
