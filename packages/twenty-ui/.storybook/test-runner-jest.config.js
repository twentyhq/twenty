import { getJestConfig } from '@storybook/test-runner';

const MINUTES_IN_MS = 60 * 1000;

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  // The default configuration comes from @storybook/test-runner
  ...getJestConfig(),
  /** Add your own overrides below
   * @see https://jestjs.io/docs/configuration
   */
  testTimeout: 5 * MINUTES_IN_MS,
  modulePathIgnorePatterns: [
    '<rootDir>/.nx/cache/*',
    '<rootDir>/packages/twenty-server/dist/*',
    '<rootDir>/packages/twenty-front/dist/*',
    '<rootDir>/packages/twenty-ui/dist/*',
  ],
};
