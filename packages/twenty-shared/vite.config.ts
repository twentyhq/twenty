import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const exports = Object.keys(packageJson.exports);
const entries = exports.map((module) => `src/${module}/index.ts`);

const entryFileNames = (chunk: any, extension: 'cjs' | 'mjs' | 'js') => {
  if (!chunk.isEntry) {
    console.log('*'.repeat(100));
    console.log(chunk);
    console.log('*'.repeat(100));
    // Should throw ?
    return `${chunk.name}.${extension}`;
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
  console.log('*'.repeat(100));
  console.log(chunk);
  console.log('*'.repeat(100));
  return `${moduleDirectory}.${extension}`; //TODO format for extensions ?
};

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/twenty-shared',

  plugins: [
    tsconfigPaths(),
    // Refactor DTS
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
    // Should read package.json
    lib: {
      entry: ['src/index.ts', ...entries],
      name: 'twenty-shared',
      // fileName: (format, fileName) => {
      //   console.log(format, fileName);
      //   const extension = format === 'cjs' ? 'js' : 'mjs';
      //   return `${fileName}.${extension}`;
      // },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: (chunk) => entryFileNames(chunk, 'mjs'),
        },
        {
          format: 'cjs',
          entryFileNames: (chunk) => entryFileNames(chunk, 'js'),
        },
      ],
    },
  },
});
