import { buildReferencedMcpServersSection } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-referenced-mcp-servers-section.util';

describe('buildReferencedMcpServersSection', () => {
  it('should return an empty string without referenced MCP servers', () => {
    expect(buildReferencedMcpServersSection([])).toBe('');
  });

  it('should list each referenced MCP server', () => {
    const section = buildReferencedMcpServersSection([
      { name: 'github', label: 'GitHub' },
      { name: 'slack', label: 'Slack' },
    ]);

    expect(section).toContain('## Referenced MCP Servers');
    expect(section).toContain('- GitHub (`github`)');
    expect(section).toContain('- Slack (`slack`)');
  });
});
