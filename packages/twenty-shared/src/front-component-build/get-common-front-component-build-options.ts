import { type BuildOptions } from 'esbuild';

export const getCommonFrontComponentBuildOptions = (): BuildOptions => ({
  bundle: true,
  splitting: false,
  format: 'esm',
  jsx: 'automatic',
  logLevel: 'silent',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});
