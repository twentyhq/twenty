import { build, transform } from 'esbuild';
import { PageLayoutType } from 'twenty-shared/types';

import { FRONT_COMPONENT_UI_IMPORTS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-ui-imports.constant';
import { buildFrontComponent as compileFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util';
import { buildFrontComponentEntrySource } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-entry-source.util';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';

jest.useRealTimers();

const sharedDependencies: Parameters<
  typeof compileFrontComponent
>[0]['sharedDependencies'] = {
  checksum: 'a'.repeat(64),
  exportNamesBySpecifier: new Map([
    ['react', { namedExports: ['useState'], hasDefaultExport: true }],
    [
      'react/jsx-runtime',
      { namedExports: ['jsx', 'jsxs', 'Fragment'], hasDefaultExport: false },
    ],
    [
      'react-dom/client',
      { namedExports: ['createRoot'], hasDefaultExport: false },
    ],
    [
      'twenty-ui/theme',
      { namedExports: ['ThemeProvider'], hasDefaultExport: false },
    ],
    ['twenty-ui/style.css', { namedExports: [], hasDefaultExport: false }],
    [
      'twenty-ui/theme-light.css',
      { namedExports: [], hasDefaultExport: false },
    ],
  ]),
};
const buildFrontComponent = (
  input: Parameters<typeof compileFrontComponent>[0]['input'],
) => compileFrontComponent({ input, sharedDependencies });

const SOURCE = `import { useState } from 'react';
type Company = { id: string; name: string };
type ComponentProps = { records: Company[] };
// Keep this filter local to the widget.
export const Component = ({ records }: ComponentProps) => {
  const [filter, setFilter] = useState('');
  return <div><input value={filter} onChange={event => setFilter(event.target.value)} />{records.filter(record => record.name.includes(filter)).map(record => <p key={record.id}>{record.name}</p>)}</div>;
};`;
const INPUT = {
  componentId: 'component-id',
  name: 'Sales "this week"',
  source: SOURCE,
  query: { objectName: 'company', select: ['name'], limit: 20 },
  pageLayoutType: PageLayoutType.DASHBOARD as const,
};

describe('buildFrontComponent', () => {
  it.each([PageLayoutType.DASHBOARD, PageLayoutType.RECORD_PAGE] as const)(
    'builds one editable SDK file for the selected %s surface',
    async (pageLayoutType) => {
      const { source, compiledSource, checksum } = await buildFrontComponent({
        ...INPUT,
        pageLayoutType,
      });

      expect(source).toContain(SOURCE);
      expect(source).toContain(
        `widgetAvailability: { pageLayoutType: TwentyPageLayoutType.${pageLayoutType} }`,
      );
      expect(source).toContain(
        'export const componentQuery = ' + JSON.stringify(INPUT.query),
      );
      expect(checksum).toMatch(/^[a-f0-9]{64}$/);
      expect(compiledSource).not.toContain('TWENTY_APP_ACCESS_TOKEN');
      await expect(
        transform(compiledSource, { loader: 'js' }),
      ).resolves.toHaveProperty('code');
      await expect(
        build({
          stdin: { contents: source, loader: 'tsx' },
          bundle: true,
          write: false,
          format: 'esm',
          external: [
            'react',
            'react/jsx-runtime',
            'twenty-sdk/define',
            'twenty-shared/types',
            ...FRONT_COMPONENT_UI_IMPORTS,
          ],
        }),
      ).resolves.toHaveProperty('outputFiles');
    },
  );

  it.each([
    'node:fs',
    'twenty-sdk',
    './secret',
    'https://example.com/code.js',
    'twenty-ui',
    'twenty-ui/components/code-editor',
    'twenty-ui/../../package.json',
    '@tabler/icons-react',
  ])('rejects unsupported import %s', async (importPath) => {
    await expect(
      buildFrontComponent({
        ...INPUT,
        source: `import value from '${importPath}'; export const Component = () => <div>{value}</div>;`,
      }),
    ).rejects.toThrow('Unsupported import');
  });

  it.each(['node:fs', 'react-dom/client', 'twenty-shared/types'])(
    'rejects unsupported dynamic import %s during the build',
    async (importPath) => {
      await expect(
        buildFrontComponent({
          ...INPUT,
          source: `export const Component = () => <button onClick={() => import('${importPath}')}>Load</button>;`,
        }),
      ).rejects.toThrow('Unsupported import');
    },
  );

  it.each([
    'import(url)',
    'import(`https://example.com/${url}.js`)',
    'require(url)',
    "require('react' + url)",
  ])('rejects computed module loading: %s', async (expression) => {
    await expect(
      buildFrontComponent({
        ...INPUT,
        source: `export const Component = ({ url }) => <button onClick={() => ${expression}}>Load</button>;`,
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      message: 'Use a string literal for import() and require().',
    });
  });

  it('rejects computed imports even when esbuild would remove the unused function', async () => {
    await expect(
      buildFrontComponent({
        ...INPUT,
        source:
          'const load = (url) => import(url); export const Component = () => <div />;',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it.each(['import("react")', 'import(`react`)', 'require("react")'])(
    'allows supported literal module loading: %s',
    async (expression) => {
      await expect(
        buildFrontComponent({
          ...INPUT,
          source: `export const Component = () => <button onClick={() => ${expression}}>Load</button>;`,
        }),
      ).resolves.toHaveProperty('compiledSource');
    },
  );

  it.each(['LIST', 'DASHBOARD }; globalThis.injected = true; //'])(
    'rejects invalid page layout before generating source: %s',
    (pageLayoutType) => {
      expect(() =>
        buildFrontComponentEntrySource({
          ...INPUT,
          pageLayoutType: pageLayoutType as typeof INPUT.pageLayoutType,
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'INVALID_INPUT',
          message: expect.stringContaining('pageLayoutType'),
          userFriendlyMessage: expect.objectContaining({
            message: 'Invalid front component settings.',
          }),
        }),
      );
    },
  );

  it.each([
    { ...INPUT.query, objectName: 'company.name' },
    { ...INPUT.query, select: [] },
    { ...INPUT.query, limit: 101 },
  ])('returns a structured error for invalid query %j', async (query) => {
    await expect(
      buildFrontComponent({ ...INPUT, query }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      userFriendlyMessage: {
        id: expect.any(String),
        message: 'Invalid front component settings.',
      },
    });
  });

  it.each([
    'export default () => <div />;',
    'export default function Component() { return <div />; }',
    'const View = () => <div />; export { View as default };',
    'export const View = () => <div />;',
  ])(
    'rejects source outside the named Component contract: %s',
    async (source) => {
      await expect(buildFrontComponent({ ...INPUT, source })).rejects.toThrow(
        FrontComponentBuildException,
      );
    },
  );

  it('returns compiler diagnostics for malformed TSX', async () => {
    await expect(
      buildFrontComponent({
        ...INPUT,
        source: 'export const Component = () => <div>;',
      }),
    ).rejects.toMatchObject({
      code: 'BUILD_FAILED',
      message: expect.stringContaining('Build failed'),
      userFriendlyMessage: {
        id: expect.any(String),
        message: 'Failed to build front component.',
      },
    });
  });

  it('rejects collisions with the SDK wrapper before saving', async () => {
    await expect(
      buildFrontComponent({
        ...INPUT,
        source:
          'export const Component = () => <div />; const componentQuery = "other";',
      }),
    ).rejects.toThrow('componentQuery');
  });
});
