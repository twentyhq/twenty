import react from '@vitejs/plugin-react-swc';
import * as path from 'path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import packageJson from './package.json';

const depNames = Object.keys({
  ...(packageJson.dependencies || {}),
  ...(packageJson.peerDependencies || {}),
});

const isExternal = (id: string): boolean =>
  depNames.some((dep) => id === dep || id.startsWith(dep + '/'));

export default defineConfig(() => {
  return {
    resolve: {
      tsconfigPaths: true,
      alias: {
        '@ui/': path.resolve(__dirname, 'src') + '/',
        '@assets/': path.resolve(__dirname, 'src/assets') + '/',
        '@styles/': path.resolve(__dirname, 'src/styles') + '/',
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          loadPaths: [path.resolve(__dirname, 'src/styles')],
          additionalData: [
            `@use 'abstracts/functions' as *;`,
            `@use 'abstracts/mixins' as *;`,
            `@use 'abstracts/breakpoints' as *;`,
            '',
          ].join('\n'),
        },
      },
    },
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-ui-individual',
    assetsInclude: ['src/**/*.svg'],
    plugins: [
      react(),
      svgr(),
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
