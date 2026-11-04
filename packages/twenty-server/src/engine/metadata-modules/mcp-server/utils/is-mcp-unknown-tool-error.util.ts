import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

const UNKNOWN_TOOL_MESSAGE_PATTERN = /not found|unknown tool/i;

// The SDK server answers an unknown tool with InvalidParams, other servers with MethodNotFound.
export const isMcpUnknownToolError = (error: unknown): boolean =>
  error instanceof McpError &&
  (error.code === ErrorCode.MethodNotFound ||
    (error.code === ErrorCode.InvalidParams &&
      UNKNOWN_TOOL_MESSAGE_PATTERN.test(error.message)));
