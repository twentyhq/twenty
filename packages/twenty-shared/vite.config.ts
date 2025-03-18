import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const exports = Object.keys(packageJson.exports);
const entries = exports.map((module) => `src/${module}/index.ts`);

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

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/twenty-shared',

  plugins: [
    tsconfigPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
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
      entry: ['src/index.ts', ...entries],
      name: 'twenty-shared',
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: (chunk) => entryFileNames(chunk, 'mjs'),
        },
        {
          format: 'cjs',
          entryFileNames: (chunk) => entryFileNames(chunk, 'cjs'),
        },
      ],
    },
  },
});
