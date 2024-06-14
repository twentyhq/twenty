/// <reference types='vitest' />
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import * as path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// eslint-disable-next-line @nx/enforce-module-boundaries, import/no-relative-packages
import packageJson from '../../package.json';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/twenty-ui',

  plugins: [
    react({ jsxImportSource: '@emotion/react' }),
    tsconfigPaths(),
    svgr(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
    checker({
      typescript: {
        tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      },
    }),
    wyw({
      include: [
        '**/OverflowingTextWithTooltip.tsx',
        '**/Chip.tsx',
        '**/Tag.tsx',
      ],
      babelOptions: {
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
      },
    }),
  ],

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'twenty-ui',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: Object.keys(packageJson.dependencies || {}),
    },
  },
});
