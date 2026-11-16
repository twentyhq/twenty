import path from 'path';
import { defineConfig } from 'vite';
import packageJson from './package.json';
import { createBundledSourcePlugin } from './vite.bundled-source-plugin';

const moduleEntries = Object.keys((packageJson as any).exports || {})
  .filter(
    (key) => key !== './style.css' && key !== '.' && !key.startsWith('./src/'),
  )
  .map((module) => `src/${module.replace(/^\.\//, '')}/index.ts`);

const entries = Object.fromEntries(
  ['src/index.ts', ...moduleEntries].map((entry) => [
    entry.replace(/^src\//, '').replace(/\.ts$/, ''),
    entry,
  ]),
);

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
          // Dev servers resolve this merged build through the `development` export
          // condition: ~40 files instead of ~1000, so they need no pre-bundling.
          {
            format: 'es',
            dir: 'dist/dev',
            entryFileNames: '[name].mjs',
            chunkFileNames: 'chunks/[name].mjs',
          },
        ],
      },
    },
    logLevel: 'warn',
  };
});
