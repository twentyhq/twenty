import { collectReferencedMcpServerIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/collect-referenced-mcp-server-ids.util';

const MCP_SERVER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const OTHER_MCP_SERVER_ID = '11111111-2222-3333-4444-555555555555';

describe('collectReferencedMcpServerIds', () => {
  it('should return the deduplicated ids of MCP servers referenced in user messages', () => {
    expect(
      collectReferencedMcpServerIds([
        {
          role: 'user',
          parts: [
            {
              type: 'text',
              text: `[[mcpServer:${MCP_SERVER_ID}:GitHub]] list my last PRs`,
            },
          ],
        },
        {
          role: 'user',
          parts: [
            {
              type: 'text',
              text: `[[mcpServer:${OTHER_MCP_SERVER_ID}:Slack]] and [[mcpServer:${MCP_SERVER_ID}:GitHub]]`,
            },
          ],
        },
      ]),
    ).toEqual([MCP_SERVER_ID, OTHER_MCP_SERVER_ID]);
  });

  it('should ignore assistant messages and other references', () => {
    expect(
      collectReferencedMcpServerIds([
        {
          role: 'assistant',
          parts: [
            { type: 'text', text: `[[mcpServer:${MCP_SERVER_ID}:GitHub]]` },
          ],
        },
        {
          role: 'user',
          parts: [
            {
              type: 'text',
              text: `[[record:company:${MCP_SERVER_ID}:Acme]] [[mcpServer:not-a-uuid:GitHub]]`,
            },
          ],
        },
      ]),
    ).toEqual([]);
  });
});
