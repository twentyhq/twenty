/// <reference types='vitest' />
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import * as path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts, { PluginOptions } from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import { UserPluginConfig } from 'vite-plugin-checker/dist/esm/types';

// eslint-disable-next-line @nx/enforce-module-boundaries, import/no-relative-packages
import packageJson from '../../package.json';

export default defineConfig(({ command }) => {
  const isBuildCommand = command === 'build';

  const tsConfigPath = isBuildCommand
    ? path.resolve(__dirname, './tsconfig.build.json')
    : path.resolve(__dirname, './tsconfig.dev.json');

  const checkersConfig: UserPluginConfig = {
    typescript: {
      tsconfigPath: tsConfigPath,
    },
  };

  const dtsConfig: PluginOptions = {
    entryRoot: 'src',
    tsconfigPath: tsConfigPath,
  };

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-ui',

    plugins: [
      react({ jsxImportSource: '@emotion/react' }),
      tsconfigPaths(),
      svgr(),
      dts(dtsConfig),
      checker(checkersConfig),
      wyw({
        include: [
          '**/OverflowingTextWithTooltip.tsx',
          '**/Chip.tsx',
          '**/Tag.tsx',
          '**/Avatar.tsx',
          '**/AvatarChip.tsx',
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
  };
});
