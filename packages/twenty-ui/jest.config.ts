import { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  displayName: 'twenty-ui',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/packages/twenty-ui',
  coverageReporters: ['text', 'text-summary'],
  setupFilesAfterEnv: ['./setupTests.ts'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};

export default jestConfig;
