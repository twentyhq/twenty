import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { getTwentySharedBuildHash } from '@/vite/getTwentySharedBuildHash';

describe('getTwentySharedBuildHash', () => {
  let distPath: string;

  beforeEach(() => {
    distPath = mkdtempSync(path.join(tmpdir(), 'twenty-shared-dist-'));
    mkdirSync(path.join(distPath, 'utils'));
    writeFileSync(path.join(distPath, 'utils', 'index.mjs'), 'export {};');
  });

  afterEach(() => {
    rmSync(distPath, { recursive: true, force: true });
  });

  it('stays the same while the build is unchanged', () => {
    expect(getTwentySharedBuildHash(distPath)).toBe(
      getTwentySharedBuildHash(distPath),
    );
  });

  it('changes when a module of the build changes', () => {
    const buildHash = getTwentySharedBuildHash(distPath);

    writeFileSync(
      path.join(distPath, 'utils', 'index.mjs'),
      'export const isDefined = () => true;',
    );

    expect(getTwentySharedBuildHash(distPath)).not.toBe(buildHash);
  });

  it('ignores files other than ES modules', () => {
    const buildHash = getTwentySharedBuildHash(distPath);

    writeFileSync(
      path.join(distPath, 'utils', 'index.cjs'),
      'module.exports = {};',
    );

    expect(getTwentySharedBuildHash(distPath)).toBe(buildHash);
  });

  it('returns a hash when the build is missing', () => {
    expect(getTwentySharedBuildHash(path.join(distPath, 'missing'))).toMatch(
      /^[0-9a-f]{16}$/,
    );
  });
});
