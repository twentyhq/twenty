// The Markdown parser packages (mdast, micromark and their helpers) ship ESM only
const TRANSFORMED_MODULES = [
  'twenty-ui',
  'twenty-shared',
  'mdast-util-[^/]+',
  'micromark[^/]*',
  'unist-util-[^/]+',
  'decode-named-character-reference',
  'character-entities[^/]*',
  'devlop',
  'ccount',
  'escape-string-regexp',
  'markdown-table',
  'longest-streak',
  'zwitch',
].join('|');

const baseProject = {
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test/setup-jest-dom.ts'],
  transformIgnorePatterns: [
    `/node_modules/(?!(${TRANSFORMED_MODULES})/.*)`,
    `../../node_modules/(?!(${TRANSFORMED_MODULES})/.*)`,
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
