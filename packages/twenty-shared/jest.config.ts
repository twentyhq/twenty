import { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
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
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
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
      '<rootDir>/__mocks__/imageMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      statements: 100,
      lines: 100,
      functions: 100,
    },
  },
};

export default jestConfig;
