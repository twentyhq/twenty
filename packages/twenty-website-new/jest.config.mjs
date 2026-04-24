import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// `tsconfig.json` is JSONC (it carries an explanatory comment header
// documenting why this package's tsconfig is intentionally standalone —
// see ARCHITECTURE.md §13). `JSON.parse` chokes on those comments;
// TypeScript's own `parseConfigFileTextToJson` is the same parser
// `tsc` uses, so it stays in lockstep with whatever JSONC features the
// real config supports.
const tsConfigPath = resolve(__dirname, './tsconfig.json');
const tsConfigText = readFileSync(tsConfigPath, 'utf8');
const { config: tsConfig, error: tsConfigError } =
  ts.parseConfigFileTextToJson(tsConfigPath, tsConfigText);
if (tsConfigError) {
  throw new Error(
    `jest.config.mjs: failed to parse tsconfig.json — ${ts.flattenDiagnosticMessageText(tsConfigError.messageText, '\n')}`,
  );
}

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
