import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import * as path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts, { type PluginOptions } from 'vite-plugin-dts';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

type Checkers = Parameters<typeof checker>[0];

import packageJson from './package.json';

const entries = Object.keys(packageJson.exports)
  .filter((el) => el !== './style.css')
  .map((module) => `src/${module}/index.ts`);

const entryFileNames = (chunk: any, extension: 'cjs' | 'mjs') => {
  if (!chunk.isEntry) {
    throw new Error(
      `Should never occurs, encountered a non entry chunk ${chunk.facadeModuleId}`,
    );
  }

  const splitFaceModuleId = chunk.facadeModuleId?.split('/');
  if (splitFaceModuleId === undefined) {
    throw new Error(
      `Should never occurs splitFaceModuleId is undefined ${chunk.facadeModuleId}`,
    );
  }

  const moduleDirectory = splitFaceModuleId[splitFaceModuleId?.length - 2];
  if (moduleDirectory === 'src') {
    return `${chunk.name}.${extension}`;
  }
  return `${moduleDirectory}.${extension}`;
};

export default defineConfig(({ command }) => {
  const isBuildCommand = command === 'build';

  const tsConfigPath = isBuildCommand
    ? path.resolve(__dirname, './tsconfig.lib.json')
    : path.resolve(__dirname, './tsconfig.dev.json');

  const checkersConfig: Checkers = {
    typescript: {
      tsconfigPath: tsConfigPath,
    },
  };

  const dtsConfig: PluginOptions = {
    entryRoot: 'src',
    tsconfigPath: tsConfigPath,
  };

  return {
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    optimizeDeps: {
      exclude: ['../../node_modules/.vite', '../../node_modules/.cache'],
    },
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-ui',
    assetsInclude: ['src/**/*.svg'],
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        plugins: [['@swc/plugin-emotion', {}]],
      }),
      tsconfigPaths({
        root: __dirname,
        projects: ['tsconfig.json'],
      }),
      svgr(),
      dts(dtsConfig),
      checker(checkersConfig),
      wyw({
        include: [
          '**/OverflowingTextWithTooltip.tsx',
          '**/Tag.tsx',
          '**/Avatar.tsx',
          '**/Chip.tsx',
          '**/LinkChip.tsx',
          '**/Avatar.tsx',
          '**/AvatarChipLeftComponent.tsx',
          '**/ContactLink.tsx',
          '**/RoundedLink.tsx',
        ],
        babelOptions: {
          presets: ['@babel/preset-typescript', '@babel/preset-react'],
        },
      }),
    ],
    // Configuration for building your library.
    // See: https://vitejs.dev/guide/build.html#library-mode
    build: {
      cssCodeSplit: false,
      minify: 'esbuild',
      sourcemap: false,
      outDir: './dist',
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
        interopDefault: true,
        defaultIsModuleExports: true,
        requireReturnsDefault: 'auto',
      },
      lib: {
        entry: ['src/index.ts', ...entries],
        name: 'twenty-ui',
      },
      rollupOptions: {
        // External packages that should not be bundled into your library.
        external: Object.keys(packageJson.dependencies || {}),
        output: [
          {
            assetFileNames: 'style.css',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
            format: 'es',
            entryFileNames: (chunk) => entryFileNames(chunk, 'mjs'),
          },
          {
            assetFileNames: 'style.css',
            format: 'cjs',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
            },
            interop: 'auto',
            esModule: true,
            exports: 'named',
            entryFileNames: (chunk) => entryFileNames(chunk, 'cjs'),
          },
        ],
      },
    },
    logLevel: 'error',
  };
});
