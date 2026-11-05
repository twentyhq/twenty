import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { isMcpUnknownToolError } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-error.util';

describe('isMcpUnknownToolError', () => {
  it('matches a method not found error', () => {
    expect(
      isMcpUnknownToolError(new McpError(ErrorCode.MethodNotFound, 'nope')),
    ).toBe(true);
  });

  it('matches the SDK server wording for a missing tool', () => {
    expect(
      isMcpUnknownToolError(
        new McpError(ErrorCode.InvalidParams, 'Tool list_issues not found'),
      ),
    ).toBe(true);
  });

  it('ignores other invalid params errors', () => {
    expect(
      isMcpUnknownToolError(
        new McpError(ErrorCode.InvalidParams, 'owner is required'),
      ),
    ).toBe(false);
    expect(
      isMcpUnknownToolError(
        new McpError(ErrorCode.InvalidParams, 'Record not found'),
      ),
    ).toBe(false);
  });
});
