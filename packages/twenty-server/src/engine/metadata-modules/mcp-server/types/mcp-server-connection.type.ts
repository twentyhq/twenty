import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';

export type McpServerConnection = Pick<
  FlatMcpServer,
  'id' | 'name' | 'url' | 'authorizationHeaderValue' | 'workspaceId'
>;
