import { execFileSync } from 'child_process';
import {
  readFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
  symlinkSync,
} from 'fs';
import { tmpdir } from 'os';
import { resolve } from 'path';
import { ToolCategory } from 'twenty-shared/ai';

import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { createGetFrontComponentUiDocsTool } from 'src/engine/metadata-modules/ai/ai-front-component/tools/get-front-component-ui-docs.tool';

const SERVER_ROOT = resolve(__dirname, '../../../../../../..');
const getDocumentation = (names: string[] = []) =>
  executeToolFromToolSet(
    { get_front_component_ui_docs: createGetFrontComponentUiDocsTool() },
    'get_front_component_ui_docs',
    { names },
    ToolCategory.FRONT_COMPONENT,
  );

beforeAll(() => {
  execFileSync(process.execPath, [
    resolve(SERVER_ROOT, 'scripts/build-ui-documentation.mjs'),
  ]);
});

describe('get_front_component_ui_docs', () => {
  it('reuses documentation across tool instances', async () => {
    const output = resolve(
      SERVER_ROOT,
      'src/engine/metadata-modules/ai/ai-front-component/constants/ui-documentation.generated.json',
    );
    const content = readFileSync(output);
    await getDocumentation(['Card']);
    try {
      writeFileSync(output, JSON.stringify({ version: 'changed', pages: [] }));
      expect(await getDocumentation(['Tabs'])).toMatchObject({ success: true });
    } finally {
      writeFileSync(output, content);
    }
  });

  it('generates available documentation when a component guide is missing', () => {
    const root = mkdtempSync(resolve(tmpdir(), 'ui-docs-'));
    try {
      const server = resolve(root, 'twenty-server');
      const ui = resolve(root, 'twenty-ui');
      const docs = resolve(root, 'twenty-docs/ui');
      mkdirSync(resolve(server, 'scripts'), { recursive: true });
      mkdirSync(resolve(ui, 'generated'), { recursive: true });
      mkdirSync(docs, { recursive: true });
      symlinkSync(
        resolve(SERVER_ROOT, '../../node_modules'),
        resolve(root, 'node_modules'),
      );
      writeFileSync(
        resolve(server, 'scripts/build-ui-documentation.mjs'),
        readFileSync(
          resolve(SERVER_ROOT, 'scripts/build-ui-documentation.mjs'),
        ),
      );
      writeFileSync(
        resolve(ui, 'package.json'),
        JSON.stringify({ version: '1.0.0' }),
      );
      writeFileSync(
        resolve(ui, 'generated/components.docs.json'),
        JSON.stringify([
          {
            name: 'Card',
            slug: 'card',
            entryPoint: 'twenty-ui/primitives/surfaces',
          },
          {
            name: 'Missing',
            slug: 'missing',
            entryPoint: 'twenty-ui/primitives/surfaces',
          },
        ]),
      );
      writeFileSync(
        resolve(docs, 'card.mdx'),
        'import API from "/snippets/ui/generated/card.mdx";',
      );
      execFileSync(
        process.execPath,
        [resolve(server, 'scripts/build-ui-documentation.mjs')],
        { stdio: 'pipe' },
      );
      expect(
        JSON.parse(
          readFileSync(
            resolve(
              server,
              'src/engine/metadata-modules/ai/ai-front-component/constants/ui-documentation.generated.json',
            ),
            'utf8',
          ),
        ),
      ).toMatchObject({ pages: [{ name: 'Card' }] });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it('returns the existing Card guide and generated compound API unchanged', async () => {
    const result = await getDocumentation(['Card']);
    const components = JSON.parse(
      readFileSync(
        resolve(SERVER_ROOT, '../twenty-ui/generated/components.docs.json'),
        'utf8',
      ),
    );

    expect(result.success).toBe(true);
    expect(result.result).toMatchObject({
      pages: [
        {
          name: 'Card',
          entryPoint: 'twenty-ui/primitives/surfaces',
          content: readFileSync(
            resolve(
              SERVER_ROOT,
              '../twenty-docs/ui/primitives/surfaces/card.mdx',
            ),
            'utf8',
          ),
          api: components.find(
            (component: { name: string }) => component.name === 'Card',
          ),
        },
      ],
    });
  });

  it('lists supported components and shared guides without loading all their content', async () => {
    const result = await getDocumentation();

    expect(result.result).toMatchObject({
      availableNames: expect.arrayContaining([
        'Card',
        'Button',
        'Tabs',
        'theming',
      ]),
    });
    expect(result.result).not.toHaveProperty('pages');
  });

  it('returns only the requested guides', async () => {
    const result = await getDocumentation(['Card', 'Tabs']);

    expect(result.result).toMatchObject({
      pages: expect.arrayContaining([
        expect.objectContaining({ name: 'Card' }),
        expect.objectContaining({ name: 'Tabs' }),
      ]),
    });
    expect(result.result).toHaveProperty('pages.length', 2);
  });

  it.each(['../../package.json', 'NonexistentComponent', 'Dropdown'])(
    'rejects unknown or unsupported documentation %s',
    async (name) => {
      expect(await getDocumentation([name])).toMatchObject({ success: false });
    },
  );
});
