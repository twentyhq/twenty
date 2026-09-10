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

const CODEMOD_PATH = resolve('tools/codemods/checkbox-api.ts');
const TSX_LOADER_PATH = createRequire(resolve('package.json')).resolve('tsx');

const createFixture = (context: TestContext, files: Record<string, string>) => {
  const directory = mkdtempSync(join(tmpdir(), 'checkbox-api-'));
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

const LEGACY_COMPONENT = `import { Checkbox, CheckboxSize, CheckboxVariant, CheckboxShape, CheckboxAccent } from 'twenty-ui/input'; export const Example = () => <Checkbox size={CheckboxSize.Small} variant={CheckboxVariant.Secondary} shape={CheckboxShape.Rounded} accent={CheckboxAccent.Orange} onChange={() => update()} />;`;

test('succeeds when there are no Checkbox matches', (context) => {
  const directory = createFixture(context, {
    'packages/example.tsx': 'export const Example = () => null;',
  });
  const result = runCodemod(directory);
  assert.equal(result.status, 0, result.stderr);
});

test('migrates enum values and zero-argument callbacks once', (context) => {
  const path = 'packages/example.tsx';
  const directory = createFixture(context, { [path]: LEGACY_COMPONENT });
  const result = runCodemod(directory);
  assert.equal(result.status, 0, result.stderr);
  const migrated = readFileSync(join(directory, path), 'utf8');
  assert.match(migrated, /size=\{'sm'\}/);
  assert.match(migrated, /variant=\{'outline'\}/);
  assert.match(migrated, /shape=\{'round'\}/);
  assert.match(migrated, /color=\{'warning'\}/);
  assert.match(migrated, /onCheckedChange=/);
  assert.doesNotMatch(
    migrated,
    /CheckboxSize|CheckboxVariant|CheckboxShape|CheckboxAccent/,
  );
  const rerun = runCodemod(directory);
  assert.equal(rerun.status, 0, rerun.stderr);
  assert.equal(readFileSync(join(directory, path), 'utf8'), migrated);
});

test('handles aliases and conditional enum values without changing unrelated identifiers', (context) => {
  const path = 'packages/example.tsx';
  const directory = createFixture(context, {
    [path]: `import { Checkbox as Selection, CheckboxAccent as Accent } from 'twenty-ui/input'; const CheckboxAccent = 'unrelated'; export const Example = () => <Selection accent={revoked ? Accent.Orange : Accent.Blue} />;`,
  });
  const result = runCodemod(directory);
  assert.equal(result.status, 0, result.stderr);
  const migrated = readFileSync(join(directory, path), 'utf8');
  assert.match(migrated, /color=\{revoked \? 'warning' : 'accent'\}/);
  assert.match(migrated, /const CheckboxAccent = 'unrelated'/);
});

test('preserves migrated type-only union imports', (context) => {
  const path = 'packages/example.tsx';
  const contents = `import { Checkbox, type CheckboxSize } from 'twenty-ui/input'; const size: CheckboxSize = 'sm'; export const Example = () => <Checkbox size={size} />;`;
  const directory = createFixture(context, { [path]: contents });
  const result = runCodemod(directory);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(directory, path), 'utf8'), contents);
});

for (const [name, element] of Object.entries({
  spread: '<Checkbox {...props} />',
  tertiaryBorder: '<Checkbox variant={CheckboxVariant.Tertiary} />',
  eventHandler:
    '<Checkbox onChange={(event) => update(event.target.checked)} />',
  handlerReference: '<Checkbox onChange={handleChange} />',
  duplicateHandler:
    '<Checkbox onChange={() => update()} onCheckedChange={() => update()} />',
  conflictingColor: '<Checkbox accent={CheckboxAccent.Blue} color="warning" />',
})) {
  test(`writes no files when ${name} needs manual migration`, (context) => {
    const files = {
      'packages/a-valid.tsx': LEGACY_COMPONENT,
      'packages/z-manual.tsx': `import { Checkbox, CheckboxAccent, CheckboxVariant } from 'twenty-ui/input'; export const Example = () => ${element};`,
    };
    const directory = createFixture(context, files);
    const result = runCodemod(directory);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /No files written/);
    for (const [path, contents] of Object.entries(files)) {
      assert.equal(readFileSync(join(directory, path), 'utf8'), contents);
    }
  });
}
