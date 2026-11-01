import { encodeFrontComponentTypeReferences } from 'twenty-shared/front-component-build';
import { getFrontComponentCompilerTypeReferences } from 'src/engine/metadata-modules/ai/ai-front-component/utils/get-front-component-compiler-type-references.util';
import { validateFrontComponentTypesOrThrow } from 'src/engine/metadata-modules/ai/ai-front-component/utils/validate-front-component-types-or-throw.util';

const typeReferences = encodeFrontComponentTypeReferences(
  getFrontComponentCompilerTypeReferences(),
).toString('base64');

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
