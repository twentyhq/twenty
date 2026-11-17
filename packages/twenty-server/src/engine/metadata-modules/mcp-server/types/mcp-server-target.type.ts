import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';

export type McpServerTarget = Pick<
  FlatMcpServer,
  'url' | 'connectionProviderId' | 'workspaceId'
> & { userWorkspaceId?: string };
