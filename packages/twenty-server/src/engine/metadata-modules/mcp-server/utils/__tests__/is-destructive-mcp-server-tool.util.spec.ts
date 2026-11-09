import { isDestructiveMcpServerTool } from 'src/engine/metadata-modules/mcp-server/utils/is-destructive-mcp-server-tool.util';

describe('isDestructiveMcpServerTool', () => {
  it.each([
    { annotations: null, expected: true },
    { annotations: {}, expected: true },
    { annotations: { destructiveHint: true }, expected: true },
    { annotations: { destructiveHint: false }, expected: false },
    { annotations: { readOnlyHint: true }, expected: false },
    {
      annotations: { readOnlyHint: true, destructiveHint: true },
      expected: false,
    },
  ])(
    'follows the MCP defaults for $annotations',
    ({ annotations, expected }) => {
      expect(isDestructiveMcpServerTool({ annotations })).toBe(expected);
    },
  );
});
