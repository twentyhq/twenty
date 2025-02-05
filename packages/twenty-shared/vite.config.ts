import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from "../../package.json";

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
      // Centralized and sync with package.json
      entry: ['src/index.ts', 'src/workflow.ts'],
      name: 'twenty-shared',
      formats: ['es', 'cjs'],
      fileName: (format, fileName) => {
        const extension = format === 'cjs' ? 'js' : 'mjs';
        return `${fileName}.${extension}`;
    },
    },
    rollupOptions: {
        external: Object.keys(packageJson.dependencies || {}),
      // preserveEntrySignatures: 'strict',
    }
  },
});
