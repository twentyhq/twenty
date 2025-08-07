import path from 'path';
import { fileURLToPath } from 'url';
import { globalConfig } from '../../eslint.config.global.mjs';
import nextPlugin from '@next/eslint-plugin-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Extend global config
  ...globalConfig,

  // Next.js specific config
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      // Next.js recommended rules (equivalent to plugin:@next/next/recommended)
      ...nextPlugin.configs.recommended.rules,
      
      // Twenty-website specific overrides
      'no-console': 'off',
      'prefer-arrow/prefer-arrow-functions': 'off',
    },
  },
];