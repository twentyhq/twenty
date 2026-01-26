import path from 'path';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    tsconfigPaths({
      root: __dirname,
      projects: ['tsconfig.json'],
    }),
  ],
  resolve: {
    alias: {
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      '@ui/': path.resolve(__dirname, 'src') + '/',
      '@assets/': path.resolve(__dirname, 'src/assets') + '/',
    },
  },
  test: {
    name: 'twenty-ui',
    environment: 'jsdom',
    globals: true,
    reporters: ['verbose'],
    watch: false,
    pool: 'forks',
    isolate: false,
    setupFiles: ['./setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.storybook/**'],
    alias: {
      // Mock static assets for tests
      '\\.(jpg|jpeg|png|gif|webp|svg)$': path.resolve(
        __dirname,
        './__mocks__/fileMock.js',
      ),
    },
    deps: {
      optimizer: {
        web: {
          include: ['twenty-shared'],
        },
      },
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text-summary'],
      reportsDirectory: './coverage',
    },
    // Performance optimizations
    maxConcurrency: 10,
    fileParallelism: true,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
