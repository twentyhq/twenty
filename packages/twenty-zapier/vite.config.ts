import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';
import type { PackageJson } from 'type-fest';

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

export default defineConfig(() => {
  const tsConfigPath = path.resolve(__dirname, './tsconfig.json');

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-zapier',
    plugins: [
      tsconfigPaths({
        root: __dirname,
      }),
      dts({ entryRoot: './src', tsconfigPath: tsConfigPath }),
    ],
    build: {
      outDir: 'lib',
      lib: { entry: 'src/index.ts', name: 'twenty-zapier' },
      rollupOptions: {
        external: (id: string) => {
          if (/^node:/.test(id)) {
            return true;
          }

          const builtins = ['path', 'fs', 'child_process', 'util'];

          if (builtins.includes(id)) {
            return true;
          }

          const deps = Object.keys(
            (packageJson as PackageJson).dependencies || {},
          );

          return deps.some((dep) => id === dep || id.startsWith(dep + '/'));
        },
        output: [
          {
            format: 'es',
            entryFileNames: (chunk) => entryFileNames(chunk, 'mjs'),
          },
          {
            format: 'cjs',
            interop: 'auto',
            esModule: true,
            exports: 'named',
            entryFileNames: (chunk) => entryFileNames(chunk, 'cjs'),
          },
        ],
      },
    },
    logLevel: 'warn',
  };
});
