import path from 'path';
import { type UserConfig, defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

const submodules = Object.keys((packageJson as any).exports || {})
  .filter((key) => key !== '.' && !key.startsWith('./src/'))
  .map((key) => key.replace(/^\.\//, ''));

const entries: Record<string, string> = {
  'individual-entry': 'src/individual-entry.ts',
};

for (const submodule of submodules) {
  entries[`${submodule}/index`] = `src/${submodule}/index.ts`;
}

const isExternal = (id: string): boolean => {
  if (id.startsWith('.') || id.startsWith('/') || id.startsWith('\0')) {
    return false;
  }

  if (id.startsWith('src/') || id.startsWith('@/')) {
    return false;
  }

  return true;
};

export default defineConfig((): UserConfig => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-shared-individual',
    resolve: {
      alias: {
        '@/': path.resolve(__dirname, 'src') + '/',
      },
    },
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
    ],
    build: {
      minify: 'esbuild',
      sourcemap: true,
      outDir: './dist/individual',
      emptyOutDir: true,
      lib: {
        entry: entries,
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
