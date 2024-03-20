/* eslint-disable */
export default {
  displayName: 'twenty-ui',
  setupFilesAfterEnv: ['./src/setupTests.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js|tsx|jsx)$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
};
