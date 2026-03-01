import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'benchmark-load-time.ts',
  timeout: 120_000,
  retries: 0,
  workers: 1,
  fullyParallel: false,
  use: {
    ...devices['Desktop Chrome'],
    headless: true,
    baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3001',
  },
  reporter: [['list']],
});
