import { pathsToModuleNameMapper } from 'ts-jest';

import tsConfig from './tsconfig.json';

const jestConfig = {
  displayName: 'twenty-ui',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['./setupTests.ts'],
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
    '\\.(jpg|jpeg|png|gif|webp|svg|svg)$': '<rootDir>/__mocks__/imageMock.js',
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageDirectory: './coverage',
};

export default jestConfig;
