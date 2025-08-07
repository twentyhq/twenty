import path from 'path';
import { fileURLToPath } from 'url';
import { globalConfig } from '../../eslint.config.global.mjs';
import { reactConfig } from '../../eslint.config.react.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  ...globalConfig,
  ...reactConfig,
  // Twenty-ui specific overrides for TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['packages/twenty-ui/tsconfig.*.json'],
      },
    },
    rules: {
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
              message:
                'Please use the custom wrapper: `useScopedHotkeys` from `@ui/utilities`',
            },
            {
              group: ['lodash'],
              message:
                "Please use the standalone lodash package (for instance: `import groupBy from 'lodash.groupby'` instead of `import { groupBy } from 'lodash'`)",
            },
          ],
        },
      ],
      '@nx/dependency-checks': 'error',
    },
  },
];