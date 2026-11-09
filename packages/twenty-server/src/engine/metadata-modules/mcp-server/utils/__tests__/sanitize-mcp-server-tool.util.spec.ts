import { sanitizeMcpServerTool } from 'src/engine/metadata-modules/mcp-server/utils/sanitize-mcp-server-tool.util';

const EMPTY_INPUT_SCHEMA = { type: 'object' as const };

describe('sanitizeMcpServerTool', () => {
  it('keeps a well-formed tool', () => {
    expect(
      sanitizeMcpServerTool({
        name: 'search_docs',
        description: '  Search the docs  ',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string' } },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, title: 'Search' },
      }),
    ).toEqual({
      name: 'search_docs',
      description: 'Search the docs',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string' } },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, title: 'Search' },
    });
  });

  it.each([
    ['empty', ''],
    ['spaces', 'search docs'],
    ['dotted', 'docs.search'],
    ['too long', 'a'.repeat(65)],
  ])('drops a tool whose name is %s', (_label, name) => {
    expect(
      sanitizeMcpServerTool({ name, inputSchema: EMPTY_INPUT_SCHEMA }),
    ).toBeNull();
  });

  it('strips control characters and caps the description length', () => {
    const tool = sanitizeMcpServerTool({
      name: 'x',
      description: `a\u0000b\u001B[31m${'c'.repeat(2000)}`,
      inputSchema: EMPTY_INPUT_SCHEMA,
    });

    expect(tool?.description).not.toMatch(/[\u0000-\u001F]/);
    expect(tool?.description).toHaveLength(1024);
  });

  it('nulls a missing description and missing annotations', () => {
    expect(
      sanitizeMcpServerTool({ name: 'x', inputSchema: EMPTY_INPUT_SCHEMA }),
    ).toEqual({
      name: 'x',
      description: null,
      inputSchema: EMPTY_INPUT_SCHEMA,
      annotations: null,
    });
  });
});
