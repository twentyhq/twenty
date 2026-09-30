import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';

import { getPublicExportErrors } from '../utils/getPublicExportErrors';
import { getPublicExportInventory } from '../utils/getPublicExportInventory';

const temporaryDirectories: string[] = [];

const readFixture = (files: Record<string, string>) => {
  const sourceRoot = mkdtempSync(path.join(tmpdir(), 'ui-public-exports-'));
  temporaryDirectories.push(sourceRoot);

  for (const [entryPoint, content] of Object.entries(files)) {
    const directory = path.join(sourceRoot, entryPoint);
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, 'index.ts'), content);
  }

  return getPublicExportInventory({
    sourceRoot,
    entryPoints: Object.keys(files),
  });
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('records support values, inline types, aliases and aggregate entry points', () => {
  const inventory = readFixture({
    '.': "export * from './utilities';",
    utilities:
      "export { useExample, type Options, value as renamed } from './support'; export type { Result } from './types';",
  });

  assert.deepEqual(inventory, {
    '.': { reExports: ['utilities'], values: {}, types: {} },
    utilities: {
      reExports: [],
      values: {
        renamed: 'utilities/support#value',
        useExample: 'utilities/support',
      },
      types: { Options: 'utilities/support', Result: 'utilities/types' },
    },
  });
});

test('reports added, removed and reclassified support exports and changed sources', () => {
  const expected = readFixture({
    utilities:
      "export { useExample } from './hooks/useExample'; export type { Result } from './types';",
  });
  const actual = readFixture({
    utilities: "export { useExample, Result, CONSTANT } from './support';",
  });

  assert.deepEqual(getPublicExportErrors({ actual, expected }).sort(), [
    'utilities types: Result does not match the public export inventory',
    'utilities values: CONSTANT does not match the public export inventory',
    'utilities values: Result does not match the public export inventory',
    'utilities values: useExample does not match the public export inventory',
  ]);
});

test('requires decisions for entry point and aggregate changes', () => {
  const expected = readFixture({ '.': 'export {};', testing: 'export {};' });
  const actual = readFixture({
    '.': "export * from './testing';",
    testing: 'export {};',
    utilities: 'export {};',
  });

  assert.deepEqual(getPublicExportErrors({ actual, expected }), [
    '. has changed aggregate exports',
    'utilities does not match the public export inventory',
  ]);
});

test('checks every member of an icon family including its public props type', () => {
  const expected = readFixture({
    icon: "export { IconOne, IconTwo } from './TablerIcons'; export type { IconProps } from './TablerIcons';",
  });
  const actual = readFixture({
    icon: "export { IconOne } from './TablerIcons'; export type { IconProps } from './TablerIcons';",
  });

  assert.deepEqual(getPublicExportErrors({ actual, expected }), [
    'icon values: IconTwo does not match the public export inventory',
  ]);
});

test('rejects private value and type exports, including test files', () => {
  for (const declaration of [
    "export { useStore } from './internal/useStore';",
    "export type { Store } from './parts/Store';",
    "export { type Store } from './internals/Store';",
    "export { Example } from './Example.stories';",
  ]) {
    assert.throws(
      () => readFixture({ utilities: declaration }),
      /exports a private or external source/,
    );
  }
});

test('rejects untracked wildcard, namespace and local exports', () => {
  for (const declaration of [
    "export * from './support';",
    "export * as support from './support';",
    "export type * from './support';",
    'export const support = true;',
    'export default true;',
    'const support = true; export { support };',
  ]) {
    assert.throws(() => readFixture({ utilities: declaration }));
  }
});
