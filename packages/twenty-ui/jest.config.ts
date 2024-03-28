import { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  displayName: 'twenty-ui',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/packages/twenty-ui',
  setupFilesAfterEnv: ['./setupTests.ts'],
  transformIgnorePatterns: ['../../node_modules/'],
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

export default jestConfig;
