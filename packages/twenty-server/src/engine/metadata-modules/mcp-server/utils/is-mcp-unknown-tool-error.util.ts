import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { isMcpUnknownToolMessage } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-message.util';

// The spec answers an unknown tool with InvalidParams, some servers with MethodNotFound.
export const isMcpUnknownToolError = (error: McpError): boolean =>
  error.code === ErrorCode.MethodNotFound ||
  (error.code === ErrorCode.InvalidParams &&
    isMcpUnknownToolMessage(error.message));
