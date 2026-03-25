import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { pathsToModuleNameMapper } from 'ts-jest';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsConfigPath = resolve(__dirname, './tsconfig.json');
const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf8'));

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
    '\\.(jpg|jpeg|png|gif|webp|svg|svg)$': '<rootDir>/__mocks__/imageMockUi.js',
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageDirectory: './coverage',
};

export default jestConfig;
