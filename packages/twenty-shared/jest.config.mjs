const jestConfig = {
  silent: true,
  displayName: 'twenty-shared',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  // @lingui v6 (and its @messageformat/date-skeleton dep) is ESM-only, so jest's
  // CJS runtime needs swc to transform it instead of skipping all of node_modules.
  transformIgnorePatterns: ['../../node_modules/(?!(@lingui|@messageformat)/.*)'],
  transform: {
    '^.+\\.m?[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
          },
          transform: {
            react: { runtime: 'automatic' },
            decoratorMetadata: true,
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    // TODO prastoin investigate not working with pathsToModuleNameMapper
    /*
      {
        '^@/(.*)\\.js$': './src/$1',
        '^@/(.*)$': './src/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1'
      } // use esm true
      { '^@/(.*)$': './src/$1' } // useEsm false
    */
    '/^@/(.*)$/': './src/$1',
    '\\.(jpg|jpeg|png|gif|webp|svg|svg\\?react)$':
      '<rootDir>/__mocks__/imageMockShared.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      statements: 80,
      lines: 90,
      functions: 75,
    },
  },
};

export default jestConfig;
