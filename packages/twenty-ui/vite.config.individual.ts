import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import * as path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

const depNames = Object.keys(packageJson.dependencies || {});

const isExternal = (id: string): boolean =>
  depNames.some((dep) => id === dep || id.startsWith(dep + '/'));

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@ui/': path.resolve(__dirname, 'src') + '/',
        '@assets/': path.resolve(__dirname, 'src/assets') + '/',
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-ui-individual',
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
    build: {
      cssCodeSplit: false,
      minify: 'esbuild',
      sourcemap: true,
      outDir: './dist/individual',
      emptyOutDir: true,
      commonjsOptions: {
        transformMixedEsModules: true,
        interopDefault: true,
        defaultIsModuleExports: true,
        requireReturnsDefault: 'auto',
      },
      lib: {
        entry: 'src/individual-entry.ts',
        formats: ['es'],
      },
      rollupOptions: {
        external: isExternal,
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
        },
      },
    },
    logLevel: 'warn',
  };
});
