import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const GENERATOR_PATH = fileURLToPath(
  new URL('../generateBarrels.ts', import.meta.url),
);
const TSX_PATH = import.meta.resolve('tsx');
const temporaryDirectories: string[] = [];

const createFixture = () => {
  const root = mkdtempSync(path.join(tmpdir(), 'ui-generated-exports-'));
  temporaryDirectories.push(root);
  const packageRoot = path.join(root, 'packages/twenty-ui');

  for (const directory of [
    'assets',
    'styles',
    'testing',
    'components/code-editor',
    'primitives/input',
    'utilities',
  ]) {
    mkdirSync(path.join(packageRoot, 'src', directory), { recursive: true });
  }

  writeFileSync(path.join(root, '.prettierrc'), '{}');
  writeFileSync(path.join(packageRoot, 'package.json'), '{}');
  writeFileSync(
    path.join(packageRoot, 'project.json'),
    '{"targets":{"build":{}}}',
  );
  writeFileSync(
    path.join(packageRoot, 'src/utilities/support.ts'),
    "export { type Options, useExample } from './internal/implementation';",
  );

  return { root, packageRoot };
};

const generate = ({ root, check = false }: { root: string; check?: boolean }) =>
  spawnSync(
    process.execPath,
    ['--import', TSX_PATH, GENERATOR_PATH, ...(check ? ['--check'] : [])],
    { cwd: root, encoding: 'utf8' },
  );

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('generates inline type re-exports as types and verifies fresh output', () => {
  const { root, packageRoot } = createFixture();
  const generation = generate({ root });
  assert.equal(generation.status, 0, generation.stderr);
  const barrel = readFileSync(
    path.join(packageRoot, 'src/utilities/index.ts'),
    'utf8',
  );

  assert.match(barrel, /export type \{ Options \} from/);
  assert.match(barrel, /export \{ useExample \} from/);
  const verification = generate({ root, check: true });
  assert.equal(verification.status, 0, verification.stderr);
});

test('rejects stale barrels, individual exports and package mappings without writing', () => {
  const { root, packageRoot } = createFixture();
  const generation = generate({ root });
  assert.equal(generation.status, 0, generation.stderr);

  for (const file of [
    'src/utilities/index.ts',
    'src/index.ts',
    'src/individual-entry.ts',
    'package.json',
    'project.json',
  ]) {
    const filePath = path.join(packageRoot, file);
    const original = readFileSync(filePath, 'utf8');
    const stale =
      file === 'project.json'
        ? '{"targets":{"build":{"outputs":[]}}}'
        : file.endsWith('.json')
          ? '{}'
          : 'export {};\n';
    writeFileSync(filePath, stale);
    const verification = generate({ root, check: true });

    assert.notEqual(verification.status, 0, file);
    assert.match(verification.stderr, /Generated exports are stale/);
    assert.equal(readFileSync(filePath, 'utf8'), stale);
    writeFileSync(filePath, original);
  }
});
