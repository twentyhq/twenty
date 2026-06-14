import { argosVitestPlugin } from '@argos-ci/storybook/vitest-plugin';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const MINUTES_IN_MS = 60 * 1000;

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        extends: './vite.config.ts',
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            ...(process.env.STORYBOOK_URL
              ? { storybookUrl: process.env.STORYBOOK_URL }
              : { storybookScript: 'yarn storybook --no-open --port 6008' }),
          }),
          argosVitestPlugin({
            uploadToArgos: !!process.env.ARGOS_TOKEN,
            token: process.env.ARGOS_TOKEN,
            apiBaseUrl: process.env.ARGOS_API_BASE_URL,
            buildName: process.env.ARGOS_BUILD_NAME || undefined,
            branch: process.env.ARGOS_BRANCH || undefined,
            commit: process.env.ARGOS_COMMIT || undefined,
            referenceCommit: process.env.ARGOS_REFERENCE_COMMIT || undefined,
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
          testTimeout: 5 * MINUTES_IN_MS,
        },
      },
    ],
  },
});
