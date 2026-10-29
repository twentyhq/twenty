const ESM_ONLY_PACKAGES = [
  'twenty-ui',
  'twenty-shared',
  'react-markdown',
  'remark-.*',
  'micromark.*',
  'mdast-util-.*',
  'hast-util-.*',
  'unist-util-.*',
  'unified',
  'vfile.*',
  'bail',
  'trough',
  'zwitch',
  'ccount',
  'devlop',
  'is-plain-obj',
  'is-alphabetical',
  'is-alphanumerical',
  'is-decimal',
  'is-hexadecimal',
  'character-.*',
  'decode-named-character-reference',
  'parse-entities',
  'stringify-entities',
  'escape-string-regexp',
  'estree-util-is-identifier-name',
  'html-url-attributes',
  'longest-streak',
  'markdown-table',
  'property-information',
  'space-separated-tokens',
  'comma-separated-tokens',
  'trim-lines',
  '@ungap/structured-clone',
].join('|');

const baseProject = {
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test/setup-jest-dom.ts'],
  transformIgnorePatterns: [
    `/node_modules/(?!(${ESM_ONLY_PACKAGES})/.*)`,
    `../../node_modules/(?!(${ESM_ONLY_PACKAGES})/.*)`,
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
