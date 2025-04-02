module.exports = {
  extends: ['../../.eslintrc.cjs'],
  overrides: [
    {
      files: ['**/*.ts'],
      parserOptions: {
        project: ['packages/twenty-shared/tsconfig.*.json'],
      },
      rules: {
        '@nx/dependency-checks': 'error',
      },
    },
  ],
};
