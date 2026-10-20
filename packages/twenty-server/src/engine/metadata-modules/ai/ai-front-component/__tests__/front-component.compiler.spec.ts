import { PageLayoutType } from 'twenty-shared/types';
import { build, transform } from 'esbuild';

import {
  buildFrontComponentEntrySource,
  compileFrontComponent,
} from '../front-component.compiler';
import { readFrontComponentQuery } from '../read-front-component-query.util';
import { frontComponentDraftSchema } from '../ai-front-component.schemas';
import { FRONT_COMPONENT_UI_IMPORTS } from '../front-component-ui.constants';

jest.useRealTimers();

const SOURCE = `import { useState } from 'react';
export default function Component({ records }) {
  const [filter, setFilter] = useState('');
  return <div><input value={filter} onChange={event => setFilter(event.target.value)} />{records.filter(record => record.name.includes(filter)).map(record => <p key={record.id}>{record.name}</p>)}</div>;
}`;

const TWENTY_UI_SOURCE = `import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { SearchInput } from 'twenty-ui/components/input';
import { Heading } from 'twenty-ui/primitives/typography';
import { Card } from 'twenty-ui/primitives/surfaces';
import { IconBuildingSkyscraper } from 'twenty-ui/icon';
export default function CompanyDirectory({ records }) {
  const [filter, setFilter] = useState('');
  return <Card.Root><Card.Header><Heading>Companies</Heading></Card.Header><Card.Content>
    <SearchInput aria-label="Filter companies" value={filter} onChange={event => setFilter(event.target.value)} />
    <Button variant="outline" startIcon={<IconBuildingSkyscraper size={16} />} onClick={() => setFilter('')}>Reset</Button>
    {records.filter(record => record.name.includes(filter)).map(record => <p key={record.id}>{record.name}</p>)}
  </Card.Content></Card.Root>;
}`;

describe('frontend component compiler', () => {
  const compile = async (source: string) => {
    const entry = await buildFrontComponentEntrySource({
      componentId: 'component-id',
      pageLayoutType: PageLayoutType.DASHBOARD,
      name: 'Companies',
      source,
      query: { objectName: 'company', select: ['name'], limit: 20 },
    });
    return compileFrontComponent(entry.source);
  };

  it.each([PageLayoutType.DASHBOARD, PageLayoutType.RECORD_PAGE])(
    'registers only the selected %s widget surface',
    async (pageLayoutType) => {
      const input = frontComponentDraftSchema.parse({
        name: 'Companies',
        source: SOURCE,
        query: { objectName: 'company', select: ['name'], limit: 20 },
        sampleRecords: [],
        pageLayoutType,
      });
      const { source } = await buildFrontComponentEntrySource({
        ...input,
        componentId: 'component-id',
      });

      expect(source).toContain(
        `widgetAvailability: { pageLayoutType: AiComponentcomponentidPageLayoutType.${pageLayoutType} }`,
      );
      expect(
        frontComponentDraftSchema.safeParse({
          ...input,
          pageLayoutType: [
            PageLayoutType.DASHBOARD,
            PageLayoutType.RECORD_PAGE,
          ],
        }).success,
      ).toBe(false);
    },
  );

  it('builds the saved SDK entry for the remote worker without embedding data or credentials', async () => {
    const { compiledSource, checksum } = await compile(SOURCE);
    expect(compiledSource).toContain('records');
    expect(compiledSource).not.toContain('TWENTY_APP_ACCESS_TOKEN');
    expect(compiledSource).not.toContain('srcdoc');
    expect(checksum).toMatch(/^[a-f0-9]{64}$/);
    await expect(
      transform(compiledSource, { loader: 'js' }),
    ).resolves.toHaveProperty('code');
  });

  it('bundles real twenty-ui controls, icons and theme for the same remote renderer', async () => {
    const { compiledSource } = await compile(TWENTY_UI_SOURCE);
    expect(compiledSource).toContain('Filter companies');
    expect(compiledSource).toContain('--t-font-color-primary:');
    expect(compiledSource).not.toMatch(/from[\s]*['"]twenty-ui/);
  });

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
      compile(
        `import value from '${importPath}'; export default () => <div>{value}</div>;`,
      ),
    ).rejects.toThrow('Unsupported import');
  });

  it('preserves a valid SDK entry even when a component name contains quotes', async () => {
    const { source } = await buildFrontComponentEntrySource({
      componentId: 'component-id',
      pageLayoutType: PageLayoutType.DASHBOARD,
      name: 'Sales "this week"',
      source: SOURCE,
      query: { objectName: 'company', select: ['name'], limit: 20 },
    });

    await expect(transform(source, { loader: 'tsx' })).resolves.toHaveProperty(
      'code',
    );
    expect(source).toContain('export default defineFrontComponent(');
  });

  it('preserves TypeScript props when saving editable source', async () => {
    const { source } = await buildFrontComponentEntrySource({
      componentId: 'component-id',
      pageLayoutType: PageLayoutType.DASHBOARD,
      name: 'Companies',
      source: `type Company = { id: string; name: string };
type CompanyListProps = { records: Company[] };
export default function CompanyList({ records }: CompanyListProps) {
  return <ul>{records.map(record => <li key={record.id}>{record.name}</li>)}</ul>;
}`,
      query: { objectName: 'company', select: ['name'], limit: 20 },
    });

    expect(source).toContain('type CompanyListProps');
    expect(source).toContain('records: Company[]');
    expect(source).toContain('}: CompanyListProps)');
    await expect(compileFrontComponent(source)).resolves.toHaveProperty(
      'compiledSource',
    );
  });

  it.each([
    SOURCE,
    TWENTY_UI_SOURCE,
    'const componentQuery = "title"; export default () => <p>{componentQuery}</p>;',
    'function View() { return <p>Hello</p>; } export { View as default };',
  ])(
    'saves a standalone SDK component with its UI and query',
    async (componentSource) => {
      const query = { objectName: 'company', select: ['name'], limit: 20 };
      const { source, componentName } = await buildFrontComponentEntrySource({
        componentId: 'component-id',
        pageLayoutType: PageLayoutType.DASHBOARD,
        name: 'Companies',
        source: componentSource,
        query,
      });
      const built = await build({
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
      });

      expect(built.outputFiles[0].text).toContain('defineFrontComponent');
      expect(source).toContain(`component: ${componentName}`);
      expect(readFrontComponentQuery(source)).toEqual(query);
      expect(source).not.toContain('documentTemplate');
      expect(source).not.toContain('generated-component');
      expect(source).toContain("import 'twenty-ui/style.css'");
      expect(source).toContain("import 'twenty-ui/theme-light.css'");
      expect(source).toContain('colorScheme="light"');
      if (componentSource === TWENTY_UI_SOURCE) {
        expect(source).toContain("from 'twenty-ui/primitives/input'");
        expect(source).toContain("from 'twenty-ui/components/input'");
        expect(source).toContain("from 'twenty-ui/icon'");
        expect(source.length).toBeLessThan(6000);
      }
    },
  );

  it('reads query literals without executing component code', () => {
    expect(
      readFrontComponentQuery(`
      export const componentQuery = { objectName: "company", select: ["name"], limit: 20 };
      throw new Error("Must never execute");
    `),
    ).toEqual({ objectName: 'company', select: ['name'], limit: 20 });
  });

  it.each([
    'getQuery()',
    '{ objectName: "company", select: ["name"], limit: getLimit() }',
    '{ objectName: "company", select: ["name"], limit: 101 }',
    '{ ...otherQuery }',
  ])('rejects dynamic or invalid query %s', (query) => {
    expect(() =>
      readFrontComponentQuery(`export const componentQuery = ${query};`),
    ).toThrow();
  });

  it('returns a useful syntax error instead of a broken preview', async () => {
    await expect(compile('export default () => <div>')).rejects.toThrow();
  });
});
