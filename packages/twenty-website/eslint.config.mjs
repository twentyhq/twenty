import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import nxPlugin from '@nx/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import linguiPlugin from 'eslint-plugin-lingui';
import preferArrowPlugin from 'eslint-plugin-prefer-arrow';
import prettierPlugin from 'eslint-plugin-prettier';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
    ],
  },

  // Base configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'prettier': prettierPlugin,
      'lingui': linguiPlugin,
      '@nx': nxPlugin,
      'prefer-arrow': preferArrowPlugin,
      'import': importPlugin,
      'unused-imports': unusedImportsPlugin,
      'unicorn': unicornPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // Next.js recommended rules
      ...nextPlugin.configs.recommended.rules,

      // Lingui rules
      'lingui/no-single-variables-to-translate': 'off',

      // General rules
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-console': 'off', // Allow console in website
      'no-control-regex': 0,
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-undef': 'off',
      'no-unused-vars': 'off',

      // Nx rules
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:backend'],
            },
            {
              sourceTag: 'scope:frontend',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:frontend'],
            },
            {
              sourceTag: 'scope:zapier',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],

      // Import rules
      'import/no-relative-packages': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-duplicates': ['error', { considerQueryString: true }],

      // Prefer arrow functions - disabled for website
      'prefer-arrow/prefer-arrow-functions': 'off',

      // Unused imports
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  // TypeScript specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports'
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'with-single-extends',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // JavaScript specific configuration
  {
    files: ['*.{js,jsx}'],
    rules: {
      // JavaScript-specific rules if needed
    },
  },

  // Test files
  {
    files: [
      '*.spec.@(ts|tsx|js|jsx)',
      '*.integration-spec.@(ts|tsx|js|jsx)',
      '*.test.@(ts|tsx|js|jsx)',
    ],
    languageOptions: {
      globals: {
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Constants files
  {
    files: ['**/constants/*.ts', '**/*.constants.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['UPPER_CASE'],
        },
      ],
      'unicorn/filename-case': [
        'warn',
        {
          cases: {
            pascalCase: true,
          },
        },
      ],
      '@nx/workspace-max-consts-per-file': ['error', { max: 1 }],
    },
  },

  // JSON files
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
  },
];
