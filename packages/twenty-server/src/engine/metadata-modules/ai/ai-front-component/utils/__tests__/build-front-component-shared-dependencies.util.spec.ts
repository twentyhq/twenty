import { runInNewContext } from 'node:vm';
import {
  getSharedDependenciesShimSource,
  toSharedDependenciesNamespaceIdentifier,
} from 'twenty-shared/front-component-build';
import { createHash } from 'crypto';
import { FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER } from 'twenty-shared/application';
import { buildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util';
import { build, transform } from 'esbuild';
import { PageLayoutType } from 'twenty-shared/types';

import { buildFrontComponent as compileFrontComponent } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component.util';

jest.useRealTimers();
jest.setTimeout(30_000);
let sharedDependencies: Awaited<
  ReturnType<typeof buildFrontComponentSharedDependencies>
>;
beforeAll(async () => {
  sharedDependencies = await buildFrontComponentSharedDependencies({
    resolveDirectory: __dirname,
  });
});
const buildFrontComponent = async (
  input: Parameters<typeof compileFrontComponent>[0]['input'],
) => ({
  ...(await compileFrontComponent({ input, sharedDependencies })),
  sharedDependencies,
});

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

describe('buildFrontComponentSharedDependencies', () => {
  it('loads real twenty-ui controls, icons and theme from one pinned shared bundle', async () => {
    const { compiledSource, sharedDependencies } = await buildFrontComponent({
      ...INPUT,
      source: `import { Button } from 'twenty-ui/primitives/input';
import { SearchInput } from 'twenty-ui/components/input';
import { Card } from 'twenty-ui/primitives/surfaces';
import { IconBuildingSkyscraper } from 'twenty-ui/icon';
export function Component() {
  return <Card.Root><Card.Content><SearchInput aria-label="Filter companies" /><Button startIcon={<IconBuildingSkyscraper />}>Reset</Button></Card.Content></Card.Root>;
}`,
    });

    expect(compiledSource).toContain('Filter companies');
    expect(compiledSource).toContain(
      FRONT_COMPONENT_SHARED_DEPENDENCIES_IMPORT_SPECIFIER,
    );
    expect(compiledSource).toMatch(
      new RegExp(
        '^// twenty-ai-shared-dependencies: ' +
          sharedDependencies.checksum +
          '\\n',
      ),
    );
    expect(
      sharedDependencies.exportNamesBySpecifier.get('react-dom')?.namedExports,
    ).toContain('createPortal');
    expect(
      sharedDependencies.exportNamesBySpecifier.get('react-dom/client')
        ?.namedExports,
    ).toContain('createRoot');
    expect(compiledSource).not.toContain('--t-font-color-primary:');
    expect(sharedDependencies.source).toContain('--t-font-color-primary:');
    expect(
      sharedDependencies.exportNamesBySpecifier.get(
        'twenty-ui/primitives/input',
      )?.namedExports,
    ).toContain('Button');
    expect(
      sharedDependencies.exportNamesBySpecifier.get('react')?.namedExports,
    ).toContain('useState');
    expect(Buffer.byteLength(compiledSource)).toBeLessThan(
      Buffer.byteLength(sharedDependencies.source) / 5,
    );
    const next = await buildFrontComponent(INPUT);
    expect(next.sharedDependencies).toBe(sharedDependencies);
    const rebuilt = await buildFrontComponentSharedDependencies({
      resolveDirectory: __dirname,
    });
    expect(rebuilt.checksum).toBe(sharedDependencies.checksum);
    expect(
      createHash('sha256').update(sharedDependencies.source).digest('hex'),
    ).toBe(sharedDependencies.checksum);
    await expect(
      build({
        stdin: { contents: compiledSource, loader: 'js' },
        write: false,
        bundle: true,
        format: 'esm',
        plugins: [
          {
            name: 'test-vendor',
            setup(build) {
              build.onResolve(
                { filter: /^twenty:front-component-shared-dependencies$/ },
                () => ({ path: 'vendor', namespace: 'vendor' }),
              );
              build.onLoad({ filter: /.*/, namespace: 'vendor' }, () => ({
                contents: sharedDependencies.source,
                loader: 'js',
              }));
            },
          },
        ],
      }),
    ).resolves.toHaveProperty('outputFiles');
    expect(compiledSource).not.toMatch(/from\s*['"]twenty-ui/);
  });

  it('exposes every server vendor export through the shared CLI and SDK shim format', async () => {
    const vendorModule: {
      exports: Record<string, Record<string, unknown>>;
    } = { exports: {} };
    const vendor = await transform(sharedDependencies.source, {
      format: 'cjs',
    });

    runInNewContext(vendor.code, {
      module: vendorModule,
      exports: vendorModule.exports,
    });

    for (const [
      specifier,
      exportNames,
    ] of sharedDependencies.exportNamesBySpecifier) {
      const shim = await transform(
        getSharedDependenciesShimSource({ specifier, exportNames }),
        { format: 'cjs' },
      );
      const shimModule: { exports: Record<string, unknown> } = { exports: {} };

      runInNewContext(shim.code, {
        module: shimModule,
        exports: shimModule.exports,
        require: () => vendorModule.exports,
      });

      const namespace =
        vendorModule.exports[
          toSharedDependenciesNamespaceIdentifier(specifier)
        ];
      const names = [
        ...exportNames.namedExports,
        ...(exportNames.hasDefaultExport ? ['default'] : []),
      ];

      for (const name of names) {
        expect(shimModule.exports[name]).toBe(namespace[name]);
      }
    }
  });
});
