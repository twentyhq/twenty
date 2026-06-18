const jestConfig = {
  displayName: 'twenty-website-redone',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  // twenty-ui and twenty-shared ship ESM (.mjs) in their dist; transform them
  // (everything else in node_modules stays ignored) so jest can load them.
  transformIgnorePatterns: [
    '/node_modules/(?!(twenty-ui|twenty-shared)/.*)',
    '../../node_modules/(?!(twenty-ui|twenty-shared)/.*)',
  ],
  transform: {
    '^.+\\.(ts|js|tsx|jsx|mjs)$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lingui/core/macro$': '<rootDir>/test/lingui-macro-mock.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  coverageDirectory: './coverage',
};

export default jestConfig;
