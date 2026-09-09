import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test, type TestContext } from 'node:test';

const CODEMOD_PATH = resolve('tools/codemods/toggle-to-switch.ts');
const TSX_LOADER_PATH = createRequire(resolve('package.json')).resolve('tsx');

const createFixture = (context: TestContext, files: Record<string, string>) => {
  const directory = mkdtempSync(join(tmpdir(), 'toggle-to-switch-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, 'packages'));
  for (const [name, contents] of Object.entries(files)) {
    const path = join(directory, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
  }
  return directory;
};

const runCodemod = (directory: string) =>
  spawnSync(process.execPath, ['--import', TSX_LOADER_PATH, CODEMOD_PATH], {
    cwd: directory,
    encoding: 'utf8',
  });

const LEGACY_COMPONENT =
  'import { Toggle } from \'twenty-ui/input\'; export const Example = () => <Toggle value={true} onChange={() => {}} toggleSize="small" />;\n';

test('succeeds when there are no Toggle matches', (context) => {
  const directory = createFixture(context, {
    'packages/example.tsx': 'export const Example = () => null;\n',
  });
  const result = runCodemod(directory);
  assert.equal(result.status, 0, result.stderr);
});

test('migrates direct consumers and leaves a rerun unchanged', (context) => {
  const path = 'packages/example.tsx';
  const directory = createFixture(context, { [path]: LEGACY_COMPONENT });
  const result = runCodemod(directory);
  assert.equal(result.status, 0, result.stderr);
  const migrated = readFileSync(join(directory, path), 'utf8');
  assert.match(migrated, /import \{ Switch \}/);
  assert.match(migrated, /checked=\{true\}/);
  assert.match(migrated, /onCheckedChange=/);
  assert.match(migrated, /size="sm"/);
  const rerun = runCodemod(directory);
  assert.equal(rerun.status, 0, rerun.stderr);
  assert.equal(readFileSync(join(directory, path), 'utf8'), migrated);
});

const UNSUPPORTED_USAGES = {
  spread: '<Toggle {...props} />',
  dynamicSize: '<Toggle toggleSize={size} />',
  styleConflict: '<Toggle color="red" style={{ opacity: 0.5 }} />',
  frontendCentering: '<Toggle centered />',
};

for (const [name, element] of Object.entries(UNSUPPORTED_USAGES)) {
  test(`does not write earlier files when a later ${name} usage needs manual migration`, (context) => {
    const files = {
      'packages/a-valid.tsx': LEGACY_COMPONENT,
      [name === 'frontendCentering'
        ? 'packages/twenty-front/z-unsupported.tsx'
        : 'packages/z-unsupported.tsx']:
        `import { Toggle } from 'twenty-ui/input'; export const Example = () => ${element};\n`,
    };
    const directory = createFixture(context, files);
    const result = runCodemod(directory);
    assert.notEqual(result.status, 0);
    for (const [path, contents] of Object.entries(files)) {
      assert.equal(readFileSync(join(directory, path), 'utf8'), contents);
    }
  });
}
