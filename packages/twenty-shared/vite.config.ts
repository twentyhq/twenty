import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const exports = Object.keys(packageJson.exports);
const entries = exports.map((module) => `src/${module}`);
console.log(entries);
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
      output: {
        entryFileNames: (chunk) => {
          console.log(chunk);
          if (!chunk.isEntry) {
            return `${chunk.name}.js`;
          }

          const splitFaceModuleId = chunk.facadeModuleId?.split('/');
          if (splitFaceModuleId === undefined) {
            throw new Error(
              `Should never occurs splitFaceModuleId is undefined ${chunk.facadeModuleId}`,
            );
          }

          const moduleDirectory =
            splitFaceModuleId[splitFaceModuleId?.length - 2];
          if (moduleDirectory === 'src') {
            return `${chunk.name}.js`;
          }

          return `${moduleDirectory}.js`; //TODO format for extensions ?
        },
      },
    },
  },
});
