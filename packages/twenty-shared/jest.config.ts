import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('./tsconfig.json');
process.env.TZ = 'GMT';

const jestConfig: JestConfigWithTsJest = {
  silent: true,
  displayName: 'twenty-shared',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['./setupTests.ts'],
  testEnvironment: 'node',
  transformIgnorePatterns: ['../../node_modules/'],
  transform: {
    '^.+\\.(ts|js)$': '@swc/jest',
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, { prefix: '<rootDir>/' }),
  },
  moduleFileExtensions: ['ts', 'js'],
  extensionsToTreatAsEsm: ['.ts'],
  coverageThreshold: {
    global: {
      statements: 95,
      lines: 95,
      functions: 95,
    },
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'types/*',
    'constants/*',
  ],
  coverageDirectory: './coverage',
};

export default jestConfig;
