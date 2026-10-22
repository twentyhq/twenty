import { MCP_SERVER_TOOL_DESCRIPTION_MAX_LENGTH } from 'src/engine/metadata-modules/mcp-server/constants/mcp-server-tool-description-max-length.constant';
import {
  sanitizeMcpServerTools,
  sanitizeMcpToolDescription,
} from 'src/engine/metadata-modules/mcp-server/utils/sanitize-mcp-server-tools.util';

const INPUT_SCHEMA = {
  type: 'object',
  properties: { query: { type: 'string' } },
};

describe('sanitizeMcpToolDescription', () => {
  it('strips control characters but keeps newlines and tabs', () => {
    expect(
      sanitizeMcpToolDescription('Search\u0000 docs\n\tby query\u001b[0m'),
    ).toBe('Search docs\n\tby query[0m');
  });

  it('caps the description length', () => {
    const sanitized = sanitizeMcpToolDescription(
      'a'.repeat(MCP_SERVER_TOOL_DESCRIPTION_MAX_LENGTH + 50),
    );

    expect(sanitized).toHaveLength(MCP_SERVER_TOOL_DESCRIPTION_MAX_LENGTH + 1);
    expect(sanitized?.endsWith('…')).toBe(true);
  });

  it('returns null for missing or blank descriptions', () => {
    expect(sanitizeMcpToolDescription(undefined)).toBeNull();
    expect(sanitizeMcpToolDescription('  \u0007 ')).toBeNull();
  });
});

describe('sanitizeMcpServerTools', () => {
  it('keeps tools whose prefixed name is a valid tool name', () => {
    const { tools, skippedToolNames } = sanitizeMcpServerTools({
      mcpServerName: 'docs',
      remoteTools: [
        {
          name: 'search_twenty_documentation',
          description: 'Search the docs',
          inputSchema: INPUT_SCHEMA,
          annotations: { readOnlyHint: true },
        },
      ],
    });

    expect(skippedToolNames).toEqual([]);
    expect(tools).toEqual([
      {
        name: 'search_twenty_documentation',
        description: 'Search the docs',
        inputSchema: INPUT_SCHEMA,
        annotations: { readOnlyHint: true },
      },
    ]);
  });

  it('skips tools whose name has forbidden characters or is too long once prefixed', () => {
    const { tools, skippedToolNames } = sanitizeMcpServerTools({
      mcpServerName: 'a'.repeat(32),
      remoteTools: [
        { name: 'search docs', inputSchema: INPUT_SCHEMA },
        { name: 'search.docs', inputSchema: INPUT_SCHEMA },
        { name: 'b'.repeat(28), inputSchema: INPUT_SCHEMA },
        { name: 'c'.repeat(27), inputSchema: INPUT_SCHEMA },
      ],
    });

    expect(skippedToolNames).toEqual([
      'search docs',
      'search.docs',
      'b'.repeat(28),
    ]);
    expect(tools.map(({ name }) => name)).toEqual(['c'.repeat(27)]);
  });

  it('skips duplicate tool names and defaults a missing schema', () => {
    const { tools, skippedToolNames } = sanitizeMcpServerTools({
      mcpServerName: 'docs',
      remoteTools: [
        { name: 'search', inputSchema: INPUT_SCHEMA },
        { name: 'search', inputSchema: INPUT_SCHEMA },
        {
          name: 'ping',
          inputSchema: null as unknown as Record<string, unknown>,
        },
      ],
    });

    expect(skippedToolNames).toEqual(['search']);
    expect(tools.map(({ name }) => name)).toEqual(['search', 'ping']);
    expect(tools[1]).toMatchObject({
      inputSchema: { type: 'object', properties: {} },
      annotations: null,
    });
  });
});
