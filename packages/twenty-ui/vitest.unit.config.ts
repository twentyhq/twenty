import baseConfig from './vite.config';
import { defineConfig, mergeConfig } from 'vitest/config';

export default defineConfig((configEnv) =>
  mergeConfig(baseConfig(configEnv), {
    test: {
      name: 'twenty-ui',
      environment: 'jsdom',
      globals: true,
      reporters: ['verbose'],
      setupFiles: ['./setupTests.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text-summary'],
        reportsDirectory: './coverage',
      },
    },
  }),
);
