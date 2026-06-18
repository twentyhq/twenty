const jestConfig = {
  displayName: 'twenty-website-redone',
  preset: '../../jest.preset.js',
  // Node is the default so the Next route + logic tests keep their Web APIs
  // (Request/Response/fetch). Component tests opt into the DOM per-file with a
  // `@jest-environment jsdom` docblock; jest-dom's matchers load for both.
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup-jest-dom.ts'],
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
