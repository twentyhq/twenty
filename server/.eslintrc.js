module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir : __dirname, 
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'src/core/@generated/**'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'func-style':['error', 'declaration', { 'allowArrowFunctions': true }],
    'no-restricted-imports': [
      'error',
      {
        'patterns': [
          {
            'group': ['**../'],
            'message': 'Relative imports are not allowed.',
          },
        ],
      },
    ],
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'type',
          'parent',
          'sibling',
          'object',
          'index',
        ],
        pathGroups: [
          {
            pattern: '@nestjs/**',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '**/interfaces/**',
            group: 'type',
            position: 'before',
          },
          {
            pattern: 'src/**',
            group: 'parent',
            position: 'before',
          },
          {
            pattern: './*',
            group: 'sibling',
            position: 'before',
          },
        ],
        distinctGroup: true,
        warnOnUnassignedImports: true,
        pathGroupsExcludedImportTypes: ['@nestjs/**'],
      },
    ],
    'unused-imports/no-unused-imports': 'warn',
    "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "no-type-imports" }],
  },
};
