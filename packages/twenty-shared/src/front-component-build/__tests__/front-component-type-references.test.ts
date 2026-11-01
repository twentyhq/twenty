/** @jest-environment node */

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
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
    includeLibraries: true,
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
const check = (files: Record<string, string>, jsx: string) =>
  getFrontComponentTypeDiagnostics({
    files: { ...platform, ...files },
    source: `import { Card } from 'fixture-ui/card'; export const Component = () => (${jsx});`,
  });

it('keeps package exports and declarations after the install directory is removed', async () => {
  const files = await capture('outline');
  await rm(directory, { recursive: true });
  expect(
    check(files, '<Card.Root variant="outline">Valid</Card.Root>'),
  ).toEqual([]);
});

it('rejects a compound namespace used as a component', async () => {
  expect(check(await capture('outline'), '<Card>Invalid</Card>')).toEqual(
    expect.arrayContaining([
      expect.stringContaining("JSX element type 'Card'"),
    ]),
  );
});

it('uses each app version rather than the server package types', async () => {
  const previous = await capture('outline');
  const current = await capture('ghost');
  expect(check(previous, '<Card.Root variant="outline" />')).toEqual([]);
  expect(check(current, '<Card.Root variant="outline" />')).toEqual(
    expect.arrayContaining([expect.stringContaining('not assignable')]),
  );
  expect(check(current, '<Card.Root variant="ghost" />')).toEqual([]);
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
        'export const Component = ({ name }: { name: string }) => <div>{name}</div>;',
    }),
  ).toEqual(
    expect.arrayContaining([
      expect.stringContaining("Property 'name' is missing"),
    ]),
  );
});

it('does not resolve imports against the host filesystem', () => {
  expect(
    getFrontComponentTypeDiagnostics({
      files: platform,
      source: `import secret from ${JSON.stringify(resolve(__dirname, '../../../../package.json'))}; export const Component = () => <div>{secret.name}</div>;`,
    }),
  ).toEqual(
    expect.arrayContaining([expect.stringContaining('Cannot find module')]),
  );
});
