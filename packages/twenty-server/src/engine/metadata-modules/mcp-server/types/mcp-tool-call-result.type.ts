import { type CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export type McpToolCallResult = {
  content: CallToolResult['content'];
  structuredContent?: Record<string, unknown>;
  isError: boolean;
};
