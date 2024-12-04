import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/twenty-shared',

  plugins: [
    tsconfigPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'), // Update if your tsconfig path differs
    }),
  ],

  build: {
    outDir: './dist',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/index.ts', // Entry point for the library
      name: 'twenty-shared',
      fileName: 'index',
      formats: ['es', 'cjs'], // Supported formats
    },
    rollupOptions: {
      // Mark external dependencies (e.g., React, etc.) to avoid bundling them
      external: ['react', 'react-dom'],
    },
  },
});