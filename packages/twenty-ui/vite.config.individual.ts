import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import * as path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

import packageJson from './package.json';

// Per-module entry points (components, theme, input, …) plus the
// combined entry that re-exports everything.  Vite code-splits so
// each module becomes its own chunk and shared deps are deduped.
const moduleEntries = Object.keys(packageJson.exports)
  .filter((exportPath) => exportPath !== './style.css' && exportPath !== '.')
  .reduce<Record<string, string>>(
    (entries, exportPath) => {
      const moduleName = exportPath.replace('./', '');

      return {
        ...entries,
        [moduleName]: `src/${moduleName}/index.ts`,
      };
    },
    {},
  );

// Only React and Emotion are externalized so the consumer's bundler
// (e.g. the front-component esbuild) resolves exactly one instance.
const EXTERNAL_PATTERNS = [
  /^react$/,
  /^react\//,
  /^react-dom$/,
  /^react-dom\//,
  /^@emotion\/react$/,
  /^@emotion\/react\//,
  /^@emotion\/styled$/,
  /^@emotion\/is-prop-valid$/,
  /^twenty-shared/,
];

const isExternal = (id: string): boolean =>
  EXTERNAL_PATTERNS.some((pattern) => pattern.test(id));

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
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
        interopDefault: true,
        defaultIsModuleExports: true,
        requireReturnsDefault: 'auto',
      },
      lib: {
        entry: {
          index: 'src/individual-entry.ts',
          ...moduleEntries,
        },
        formats: ['es'],
      },
      rollupOptions: {
        external: isExternal,
        output: {
          // Stable chunk names (no hashes) so consumers can reference them
          chunkFileNames: 'shared/[name].js',
        },
      },
    },
    logLevel: 'warn',
  };
});
