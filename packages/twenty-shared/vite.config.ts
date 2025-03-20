import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const exports = Object.keys(packageJson.exports);
const removeDotAndSlash = (str: string) => str.replace(/\.|\//g, '');
const entriesRecord = exports
  .filter((module) => module !== '.')
  .map(removeDotAndSlash)
  .reduce(
    (acc, module) => ({ ...acc, [module]: `src/${module}/index.ts` }),
    {},
  );

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
      name: 'twenty-shared',
      entry: {
        root: 'src/index.ts',
        ...entriesRecord,
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => {
        const isCommonJs = format === 'cjs' || format === 'commonjs';
        return `${entryName}.${isCommonJs ? 'cjs' : 'mjs'}`;
      },
    },
  },
});
