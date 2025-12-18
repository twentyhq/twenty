import typescriptParser from '@typescript-eslint/parser';
import path from 'path';
import { fileURLToPath } from 'url';
import reactConfig from '../../eslint.config.react.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // Extend shared React configuration
  ...reactConfig,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
    ],
  },

  // TypeScript project-specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: [path.resolve(__dirname, 'tsconfig.*.json')],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Override import restrictions for twenty-ui
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@tabler/icons-react'],
              message: 'Please import icons from `@ui/display`',
            },
            {
              group: ['react-hotkeys-web-hook'],
              importNames: ['useHotkeys'],
              message: 'Please use the custom wrapper: `useScopedHotkeys` from `@ui/utilities`',
            },
            {
              group: ['lodash'],
              message: "Please use the standalone lodash package (for instance: `import groupBy from 'lodash.groupby'` instead of `import { groupBy } from 'lodash'`)",
            },
            {
              group: ['@lingui/*'],
              message: 'Lingui should not be used in twenty-ui. Pass translatable strings as props from twenty-front instead.',
            },
          ],
        },
      ],

      // Nx dependency checks
      '@nx/dependency-checks': 'error',

      // Disable lingui rules for twenty-ui - translations should be handled in twenty-front
      'lingui/no-unlocalized-strings': 'off',
      'lingui/t-call-in-function': 'off',
      'lingui/no-single-variables-to-translate': 'off',
      'lingui/no-expression-in-message': 'off',
      'lingui/no-single-tag-to-translate': 'off',
      'lingui/no-trans-inside-trans': 'off',
      'lingui/text-restrictions': 'off',
    },
  },
];
