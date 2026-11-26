import {
  collectFrontComponentTypeReferences,
  encodeFrontComponentTypeReferencesOrThrow,
} from 'twenty-shared/front-component-build';
import { getFrontComponentCompilerTypeReferences } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-compiler-type-references.util';
import { validateFrontComponentTypesOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-types-or-throw.util';

const typeReferences = encodeFrontComponentTypeReferencesOrThrow(
  getFrontComponentCompilerTypeReferences(),
).toString('base64');

it('checks the real SDK record context signatures without an app SDK dependency', () => {
  const source = `import { useSelectedRecordIds, useSelectedObjectMetadata } from 'twenty-sdk/front-component';
    export const Component = () => {
      const recordId: string | undefined = useSelectedRecordIds()[0];
      const name: string | undefined = useSelectedObjectMetadata()?.nameSingular;
      return <div>{name}: {recordId}</div>;
    };`;

  expect(() =>
    validateFrontComponentTypesOrThrow({ typeReferences, source }),
  ).not.toThrow();
  expect(() =>
    validateFrontComponentTypesOrThrow({
      typeReferences,
      source: source.replace(
        'recordId: string | undefined',
        'recordId: number',
      ),
    }),
  ).toThrow('TS2322');
});

it('rejects nonexistent SDK exports even when stale app references declare them', () => {
  expect(() =>
    validateFrontComponentTypesOrThrow({
      typeReferences: encodeFrontComponentTypeReferencesOrThrow({
        ...getFrontComponentCompilerTypeReferences(),
        '/node_modules/twenty-sdk/package.json': JSON.stringify({
          exports: { './front-component': './old.d.ts' },
        }),
        '/node_modules/twenty-sdk/old.d.ts':
          'export declare function unsupportedCapability(path: string): void;',
      }).toString('base64'),
      source: `import { unsupportedCapability } from 'twenty-sdk/front-component'; export const Component = () => <div />;`,
    }),
  ).toThrow('TS2305');
});

it('returns a source location and TypeScript error through the existing build failure', () => {
  expect(() =>
    validateFrontComponentTypesOrThrow({
      typeReferences,
      source:
        'export const Component = () => { const count: number = "wrong"; return <div>{count}</div>; };',
    }),
  ).toThrow(
    expect.objectContaining({
      code: 'BUILD_FAILED',
      message: expect.stringContaining('component.tsx:1:'),
    }),
  );
});

it('accepts a valid component without installing dependencies', () => {
  expect(() =>
    validateFrontComponentTypesOrThrow({
      typeReferences,
      source: 'export const Component = () => <div>Valid</div>;',
    }),
  ).not.toThrow();
});

it('includes the public React DOM entry point when the app has no React declaration packages', () => {
  expect(() =>
    validateFrontComponentTypesOrThrow({
      typeReferences,
      source: `import { createPortal } from 'react-dom'; export const Component = () => createPortal(<div>Portal</div>, document.body);`,
    }),
  ).not.toThrow();
});

it('typechecks public navigation, context and translation APIs', () => {
  expect(() =>
    validateFrontComponentTypesOrThrow({
      typeReferences,
      source: `import { AppPath, navigate, useColorScheme, useRecordId, useFrontComponentExecutionContext, Trans } from 'twenty-sdk/front-component';
      export const Component = () => {
        const color: 'light' | 'dark' = useColorScheme();
        const recordId: string | null = useRecordId();
        const userId = useFrontComponentExecutionContext(context => context.userId);
        return <button onClick={() => navigate(AppPath.Settings)}><Trans message="Open" />{color}{recordId}{userId}</button>;
      };`,
    }),
  ).not.toThrow();
});
it('rejects invalid public navigation paths', () => {
  expect(() =>
    validateFrontComponentTypesOrThrow({
      typeReferences,
      source: `import { navigate } from 'twenty-sdk/front-component';
      export const Component = () => <button onClick={() => navigate('/not-an-app-path')}>Open</button>;`,
    }),
  ).toThrow('TS2345');
});

it('typechecks Metadata API field option queries against client declarations', () => {
  const metadataTypeReferences = encodeFrontComponentTypeReferencesOrThrow({
    ...getFrontComponentCompilerTypeReferences(),
    ...collectFrontComponentTypeReferences({
      directory: __dirname,
      dependencies: ['twenty-client-sdk/metadata'],
    }),
  }).toString('base64');
  expect(() =>
    validateFrontComponentTypesOrThrow({
      typeReferences: metadataTypeReferences,
      source: `import { MetadataApiClient } from 'twenty-client-sdk/metadata';
      export const Component = () => <button onClick={() => new MetadataApiClient().query({
        object: { __args: { id: 'opportunity' }, fields: { __args: { filter: {}, paging: { first: 100 } }, edges: { node: { name: true, options: true } } } },
      })}>Read stage options</button>;`,
    }),
  ).not.toThrow();
});
