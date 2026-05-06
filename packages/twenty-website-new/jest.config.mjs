import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { pathsToModuleNameMapper } from 'ts-jest';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsConfig = JSON.parse(
  readFileSync(resolve(__dirname, './tsconfig.json'), 'utf8'),
);

const jestConfig = {
  displayName: 'twenty-website-new',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transformIgnorePatterns: ['../../node_modules/'],
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          experimental: {
            plugins: [
              [
                '@lingui/swc-plugin',
                {
                  runtimeModules: {
                    i18n: ['@lingui/core', 'i18n'],
                    trans: ['@lingui/react', 'Trans'],
                  },
                },
              ],
            ],
          },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  coverageDirectory: './coverage',
};

export default jestConfig;
