import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
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

    expect(result.result).toMatchObject({ pages: expect.any(Array) });
    expect(
      (result.result as { pages: { name: string }[] }).pages
        .map((page) => page.name)
        .sort(),
    ).toEqual(['Card', 'Tabs']);
  });

  it.each(['../../package.json', 'NonexistentComponent', 'Dropdown'])(
    'rejects unknown or unsupported documentation %s',
    async (name) => {
      expect(await getDocumentation([name])).toMatchObject({ success: false });
    },
  );
});
