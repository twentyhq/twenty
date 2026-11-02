/** @jest-environment node */

import { mkdtemp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import ts from 'typescript';
import { FRONT_COMPONENT_TYPE_REFERENCES_MAX_BYTES } from '../front-component-type-references-max-bytes';
import { join, posix, resolve } from 'node:path';
import { collectFrontComponentTypeReferences } from '../collect-front-component-type-references';
import { decodeFrontComponentTypeReferences } from '../decode-front-component-type-references';
import { encodeFrontComponentTypeReferences } from '../encode-front-component-type-references';
import { getFrontComponentTypeDiagnostics } from '../get-front-component-type-diagnostics';

let platform: Record<string, string>;
let directory: string;

beforeAll(() => {
  platform = collectFrontComponentTypeReferences({
    directory: resolve(__dirname, '../../../..'),
    dependencies: ['react', 'react/jsx-runtime'],
    shouldIncludeLibraries: true,
  });
});
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'component-types-'));
  await mkdir(join(directory, 'node_modules/fixture-ui'), { recursive: true });
  await writeFile(
    join(directory, 'node_modules/fixture-ui/package.json'),
    JSON.stringify({
      name: 'fixture-ui',
      exports: { './card': { types: './card.d.ts', default: './card.js' } },
    }),
  );
  await writeFile(
    join(directory, 'node_modules/fixture-ui/card.js'),
    'throw new Error("Do not execute dependencies when reading types");',
  );
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

const capture = async (variant: string) => {
  await writeFile(
    join(directory, 'node_modules/fixture-ui/card.d.ts'),
    `export { Card } from './';`,
  );
  await writeFile(
    join(directory, 'node_modules/fixture-ui/index.d.ts'),
    `import { type FC } from 'react'; export declare const Card: { Root: FC<{ variant?: '${variant}'; children?: import('react').ReactNode }> };`,
  );
  return decodeFrontComponentTypeReferences(
    encodeFrontComponentTypeReferences(
      collectFrontComponentTypeReferences({
        directory,
        dependencies: ['fixture-ui/card'],
      }),
    ),
  );
};
const check = ({
  files,
  jsx,
}: {
  files: Record<string, string>;
  jsx: string;
}) =>
  getFrontComponentTypeDiagnostics({
    files: { ...platform, ...files },
    source: `import { Card } from 'fixture-ui/card'; export const Component = () => (${jsx});`,
  });

it('keeps package exports and declarations after the install directory is removed', async () => {
  const files = await capture('outline');
  await rm(directory, { recursive: true });
  expect(
    check({ files, jsx: '<Card.Root variant="outline">Valid</Card.Root>' }),
  ).toEqual([]);
});

it('rejects a compound namespace used as a component', async () => {
  expect(
    check({ files: await capture('outline'), jsx: '<Card>Invalid</Card>' }),
  ).toEqual(
    expect.arrayContaining([
      expect.stringContaining("JSX element type 'Card'"),
    ]),
  );
});

it('uses each app version rather than the server package types', async () => {
  const previous = await capture('outline');
  const current = await capture('ghost');
  expect(
    check({ files: previous, jsx: '<Card.Root variant="outline" />' }),
  ).toEqual([]);
  expect(
    check({ files: current, jsx: '<Card.Root variant="outline" />' }),
  ).toEqual(
    expect.arrayContaining([expect.stringContaining('not assignable')]),
  );
  expect(
    check({ files: current, jsx: '<Card.Root variant="ghost" />' }),
  ).toEqual([]);
});

it('checks generated SDK query fields using the supplied app types', () => {
  const files = {
    ...platform,
    '/node_modules/twenty-client-sdk/core.d.ts': `export declare class CoreApiClient { query(input: { companies: { name: boolean } }): Promise<{ companies: { name: string }[] }> }`,
  };
  const source = `import { CoreApiClient } from 'twenty-client-sdk/core'; export const Component = () => { new CoreApiClient().query({ companies: { missingField: true } }); return <div />; };`;
  expect(getFrontComponentTypeDiagnostics({ files, source })).toEqual(
    expect.arrayContaining([expect.stringContaining('missingField')]),
  );
});

it('rejects a Component requiring props that previews do not supply', () => {
  expect(
    getFrontComponentTypeDiagnostics({
      files: platform,
      source:
        '\nexport const Component = ({ name }: { name: string }) => <div>{name}</div>;',
    }),
  ).toEqual(
    expect.arrayContaining([
      expect.stringMatching(
        /component\.tsx:2:\d+ TS2741: Property 'name' is missing/,
      ),
    ]),
  );
});

it('does not resolve imports against an existing host file', async () => {
  const file = join(directory, 'secret.ts');
  await writeFile(file, 'export const secret = "host value";');
  expect(await readFile(file, 'utf8')).toContain('host value');
  expect(
    getFrontComponentTypeDiagnostics({
      files: platform,
      source: `import { secret } from ${JSON.stringify(file.slice(0, -3))}; export const Component = () => <div>{secret}</div>;`,
    }),
  ).toEqual(
    expect.arrayContaining([expect.stringContaining('Cannot find module')]),
  );
});

it('captures dependencies when the source directory uses Windows separators', async () => {
  await capture('outline');
  const windowsDirectory = directory.replace(/\//g, '\\');
  const normalizedRoot = posix.normalize(
    resolve(windowsDirectory).replace(/\\/g, '/'),
  );
  const system = { ...ts.sys };
  const localPath = (path: string) => path.replace(normalizedRoot, directory);
  try {
    ts.sys.readFile = (path) => system.readFile(localPath(path));
    ts.sys.fileExists = (path) => system.fileExists(localPath(path));
    ts.sys.directoryExists = (path) => system.directoryExists(localPath(path));
    const files = collectFrontComponentTypeReferences({
      directory: windowsDirectory,
      dependencies: ['fixture-ui/card'],
    });
    expect(files['/node_modules/fixture-ui/index.d.ts']).toContain('Card');
  } finally {
    Object.assign(ts.sys, system);
  }
});

it('rejects oversized type references before compressing or uploading them', () => {
  expect(() =>
    encodeFrontComponentTypeReferences({
      '/large.d.ts': 'x'.repeat(FRONT_COMPONENT_TYPE_REFERENCES_MAX_BYTES),
    }),
  ).toThrow('type references exceed the 32 MiB limit');
});
