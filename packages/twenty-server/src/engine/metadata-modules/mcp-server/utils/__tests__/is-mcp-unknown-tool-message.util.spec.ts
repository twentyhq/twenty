import { isMcpUnknownToolMessage } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-message.util';

describe('isMcpUnknownToolMessage', () => {
  it.each([
    'MCP error -32602: Tool search_docs not found',
    "Tool 'search_docs' not found",
    'Unknown tool: search_docs',
    'tool not found: search_docs',
  ])('matches "%s"', (message) => {
    expect(isMcpUnknownToolMessage(message)).toBe(true);
  });

  it.each([
    'Record not found',
    'Tool list_issues failed: repository not found',
    'owner is required',
  ])('ignores "%s"', (message) => {
    expect(isMcpUnknownToolMessage(message)).toBe(false);
  });
});
