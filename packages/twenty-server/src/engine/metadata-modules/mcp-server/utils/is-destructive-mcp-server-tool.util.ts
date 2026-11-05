import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';

export const isDestructiveMcpServerTool = ({
  annotations,
}: Pick<McpServerTool, 'annotations'>): boolean =>
  !annotations?.readOnlyHint && annotations?.destructiveHint !== false;
