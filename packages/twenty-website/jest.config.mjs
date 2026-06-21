const baseProject = {
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test/setup-jest-dom.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(twenty-ui|twenty-shared)/.*)',
    '../../node_modules/(?!(twenty-ui|twenty-shared)/.*)',
  ],
  transform: {
    '^.+\\.(ts|js|tsx|jsx|mjs)$': [
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
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@lingui/core/macro$': '<rootDir>/test/lingui-macro-mock.ts',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
};

const jestConfig = {
  projects: [
    {
      ...baseProject,
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
    },
    {
      ...baseProject,
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.tsx'],
    },
  ],
  coverageDirectory: './coverage',
};

export default jestConfig;
