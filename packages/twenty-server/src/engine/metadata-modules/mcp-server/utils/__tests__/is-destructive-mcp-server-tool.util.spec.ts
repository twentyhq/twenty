import { isDestructiveMcpServerTool } from 'src/engine/metadata-modules/mcp-server/utils/is-destructive-mcp-server-tool.util';

describe('isDestructiveMcpServerTool', () => {
  it('trusts an explicit destructive hint', () => {
    expect(
      isDestructiveMcpServerTool({ annotations: { destructiveHint: true } }),
    ).toBe(true);
  });

  it('ignores the destructive hint of a read-only tool', () => {
    expect(
      isDestructiveMcpServerTool({
        annotations: { destructiveHint: true, readOnlyHint: true },
      }),
    ).toBe(false);
  });

  it('does not flag a tool without a destructive hint', () => {
    expect(isDestructiveMcpServerTool({ annotations: null })).toBe(false);
    expect(isDestructiveMcpServerTool({ annotations: {} })).toBe(false);
  });
});
