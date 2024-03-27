export default {
  displayName: 'twenty-ui',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/packages/twenty-ui',
  coverageReporters: ['text', 'text-summary'],
  setupFilesAfterEnv: ['./setupTests.ts'],
};
