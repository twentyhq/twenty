import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

export type WorkflowMcpServerToolLookup =
  | { status: 'found'; mcpServer: FlatMcpServer; tool: McpServerTool }
  | {
      status: 'server_not_found' | 'server_inactive' | 'tool_not_found';
      message: string;
    };
