import path from 'path';
import { fileURLToPath } from 'url';
import { globalConfig } from '../../eslint.config.global.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Extend global config
  ...globalConfig,

  // Twenty-shared specific TypeScript config
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['packages/twenty-shared/tsconfig.*.json'],
      },
    },
    rules: {
      '@nx/dependency-checks': 'error',
    },
  },
];