import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';

import { getPublicExportSnapshot } from '../getPublicExportSnapshot';

const temporaryDirectories: string[] = [];

const createPackage = ({
  files,
  entries = ['.'],
  sourceDirectory = '.',
}: {
  files: Record<string, string>;
  entries?: string[];
  sourceDirectory?: string;
}) => {
  const temporaryDirectory = mkdtempSync(
    path.join(tmpdir(), 'ui-public-exports-'),
  );
  temporaryDirectories.push(temporaryDirectory);
  const sourceRoot = path.join(temporaryDirectory, sourceDirectory);

  for (const [fileName, source] of Object.entries(files)) {
    const filePath = path.join(sourceRoot, fileName);
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, source);
  }

  return {
    sourceRoot,
    entryPoints: Object.fromEntries(
      entries.map((entryName) => [
        entryName,
        path.join(sourceRoot, entryName, 'index.ts'),
      ]),
    ),
  };
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('records hooks, constants, contexts, types, and inherited public entries', () => {
  const packageSources = createPackage({
    entries: ['.', './theme'],
    files: {
      'index.ts': `
        export * from './theme';
        export { useToast, ToastContext, TOAST_LIMIT } from './toast';
        export type { ToastOptions } from './toast';
      `,
      'toast.ts': `
        export const useToast = () => undefined;
        export const ToastContext = {};
        export const TOAST_LIMIT = 3;
        export type ToastOptions = { message: string };
      `,
      'theme/index.ts': 'export * from "./theme";',
      'theme/theme.ts': 'export const useTheme = () => undefined;',
    },
  });

  assert.deepEqual(getPublicExportSnapshot(packageSources), {
    '.': [
      '* from ./theme',
      'TOAST_LIMIT',
      'ToastContext',
      'type ToastOptions',
      'useToast',
    ],
    './theme': ['useTheme'],
  });
});

for (const exportStatement of [
  "export type { PrivateOptions } from './internal/options';",
  "export { type PrivateOptions } from './internal/options';",
  "export * from './internal/options';",
  "export type * from './internal/options';",
  "export * as options from './internal/options';",
]) {
  test(`rejects implementation exports through ${exportStatement}`, () => {
    const packageSources = createPackage({
      files: {
        'index.ts': exportStatement,
        'internal/options.ts': 'export type PrivateOptions = string;',
      },
    });

    assert.throws(
      () => getPublicExportSnapshot(packageSources),
      /exports an implementation part/,
    );
  });
}

test('rejects private aliases exposed through a public facade', () => {
  const packageSources = createPackage({
    files: {
      'index.ts': "export { PublicOptions } from './facade';",
      'facade.ts': `
        import type { PrivateOptions } from './parts/options';
        export type { PrivateOptions as PublicOptions };
      `,
      'parts/options.ts': 'export type PrivateOptions = string;',
    },
  });

  assert.throws(
    () => getPublicExportSnapshot(packageSources),
    /PublicOptions from parts\/options.ts/,
  );
});

test('allows public declarations that use private implementations', () => {
  const packageSources = createPackage({
    files: {
      'index.ts': "export type { PublicOptions } from './options';",
      'options.ts': `
        import type { PrivateOptions } from './internals/options';
        export type PublicOptions = { options: PrivateOptions };
      `,
      'internals/options.ts': 'export type PrivateOptions = string;',
    },
  });

  assert.deepEqual(getPublicExportSnapshot(packageSources), {
    '.': ['type PublicOptions'],
  });
});

test('groups Tabler icons while recording icon support APIs individually', () => {
  const packageSources = createPackage({
    files: {
      'index.ts': "export * from './icon/components/TablerIcons';",
      'icon/components/TablerIcons.ts': `
        export { IconPlus, IconMinus } from '@tabler/icons-react';
        export type { IconExternalProps } from '@tabler/icons-react';
        export type TablerIconsProps = { size: number };
        export const IconSupport = () => undefined;
      `,
    },
  });

  assert.deepEqual(getPublicExportSnapshot(packageSources), {
    '.': [
      'Icon* from icon/components/TablerIcons.ts',
      'IconSupport',
      'type IconExternalProps',
      'type TablerIconsProps',
    ],
  });
});

test('rejects a published entry without a source file', () => {
  const packageSources = createPackage({ files: {} });

  assert.throws(
    () => getPublicExportSnapshot(packageSources),
    /Public export source is missing/,
  );
});

test('rejects star exports whose source cannot be inspected', () => {
  const packageSources = createPackage({
    files: { 'index.ts': "export * from 'external-package';" },
  });

  assert.throws(
    () => getPublicExportSnapshot(packageSources),
    /star export without inspectable package source/,
  );
});

test('distinguishes runtime values from type-only aliases and star exports', () => {
  const packageSources = createPackage({
    files: {
      'index.ts': `
        export { RuntimeValue } from './values';
        export type { RuntimeValue as TypeOnlyAlias } from './values';
        export type * from './star-values';
        export type PlainType = string;
      `,
      'values.ts': 'export const RuntimeValue = 1;',
      'star-values.ts': 'export const StarValue = 2;',
    },
  });

  assert.deepEqual(getPublicExportSnapshot(packageSources), {
    '.': [
      'RuntimeValue',
      'type PlainType',
      'type StarValue',
      'type TypeOnlyAlias',
    ],
  });
});

test('rejects unresolved named exports from local sources', () => {
  const packageSources = createPackage({
    files: { 'index.ts': "export { Missing } from './missing';" },
  });

  assert.throws(
    () => getPublicExportSnapshot(packageSources),
    /unresolved public export/,
  );
});

test('allows packages located inside directories named internal or parts', () => {
  const packageSources = createPackage({
    sourceDirectory: 'internal/parts/source',
    files: {
      'index.ts': "export { PublicValue } from './value';",
      'value.ts': 'export const PublicValue = 1;',
    },
  });

  assert.deepEqual(getPublicExportSnapshot(packageSources), {
    '.': ['PublicValue'],
  });
});
