/** @jest-environment node */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import * as esbuild from 'esbuild';

import { enumerateSharedDependenciesExportNames } from 'twenty-shared/front-component-build';

jest.useRealTimers();

describe('enumerateSharedDependenciesExportNames', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'shared-export-discovery-'));
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('discovers browser exports without executing package code', async () => {
    await writeFile(
      join(appPath, 'browser.mjs'),
      `throw new Error('must not execute');
export const element = document.createElement('div');
export default window.location;`,
    );

    await expect(
      enumerateSharedDependenciesExportNames({
        appPath,
        specifier: './browser.mjs',
      }),
    ).resolves.toEqual({ namedExports: ['element'], hasDefaultExport: true });
  });

  it('collects production CommonJS reexports through cycles without evaluation', async () => {
    await writeFile(
      join(appPath, 'index.cjs'),
      `if (process.env.NODE_ENV === 'production') {
  module.exports = require('./production.cjs');
} else {
  module.exports = require('./development.cjs');
}
throw new Error('must not execute');`,
    );
    await writeFile(
      join(appPath, 'production.cjs'),
      `exports.production = true; Object.assign(exports, require('./index.cjs'));`,
    );
    await writeFile(
      join(appPath, 'development.cjs'),
      'exports.development = true;',
    );

    await expect(
      enumerateSharedDependenciesExportNames({
        appPath,
        specifier: './index.cjs',
      }),
    ).resolves.toEqual({
      namedExports: ['production'],
      hasDefaultExport: true,
    });
  });

  it('preserves an injected build failure for bounded server builds', async () => {
    const error = new Error('Build timed out');

    await expect(
      enumerateSharedDependenciesExportNames({
        appPath,
        specifier: './index.mjs',
        build: async () => {
          throw error;
        },
      }),
    ).rejects.toBe(error);
  });

  it('rejects incomplete input metadata instead of returning partial exports', async () => {
    await writeFile(join(appPath, 'index.cjs'), 'exports.example = true;');

    await expect(
      enumerateSharedDependenciesExportNames({
        appPath,
        specifier: './index.cjs',
        build: async (options) => {
          const result = await esbuild.build({ ...options, metafile: true });

          return {
            ...result,
            metafile: { ...result.metafile, inputs: {} },
          };
        },
      }),
    ).rejects.toThrow('Missing dependency input metadata for "index.cjs".');
  });
});
