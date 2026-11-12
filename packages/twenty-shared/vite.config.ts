import path from 'path';
import { defineConfig } from 'vite';
import packageJson from './package.json';
import { createBundledSourcePlugin } from './vite.bundled-source-plugin';

const moduleEntries = Object.keys((packageJson as any).exports || {})
  .filter(
    (key) => key !== './style.css' && key !== '.' && !key.startsWith('./src/'),
  )
  .map((module) => `src/${module.replace(/^\.\//, '')}/index.ts`);

const entries = ['src/index.ts', ...moduleEntries];

// Tooling skips dist/node_modules, and Node reads `?source` as a URL query.
const getOutputFileName =
  (extension: 'cjs' | 'mjs') =>
  ({ name }: { name: string }) =>
    `${name
      .replace(/^(?:.*\/)?node_modules\//, 'vendor/')
      .replace(/\.tsx?\?source$/, '.source')}.${extension}`;

export default defineConfig(() => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-shared',
    plugins: [createBundledSourcePlugin()],
    resolve: {
      tsconfigPaths: true,
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    build: {
      emptyOutDir: false,
      outDir: 'dist',
      lib: { entry: entries, name: 'twenty-shared' },
      rollupOptions: {
        external: [
          ...Object.keys((packageJson as any).dependencies || {}),
          'typescript',
          'node:fs',
          'node:fs/promises',
          'node:path',
          'node:zlib',
          // TODO: i18n now hashes with @noble/hashes, so this node:crypto external looks removable.
          'node:crypto',
        ],
        output: [
          {
            format: 'es',
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: getOutputFileName('mjs'),
          },
          {
            format: 'cjs',
            esModule: true,
            exports: 'named',
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: getOutputFileName('cjs'),
          },
        ],
      },
    },
    logLevel: 'warn',
  };
});
