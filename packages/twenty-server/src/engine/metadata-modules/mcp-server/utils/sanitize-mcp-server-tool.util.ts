import { type Tool } from '@modelcontextprotocol/sdk/types.js';

import { mcpServerToolSchema } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.schema';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

export const sanitizeMcpServerTool = (
  remoteTool: Tool,
): McpServerTool | null => {
  const result = mcpServerToolSchema.safeParse(remoteTool);

  return result.success ? result.data : null;
};
