const jestConfig = {
  silent: true,
  displayName: 'twenty-shared',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['../../node_modules/'],
  transform: {
    '^.+\\.[tj]sx?$': [
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
