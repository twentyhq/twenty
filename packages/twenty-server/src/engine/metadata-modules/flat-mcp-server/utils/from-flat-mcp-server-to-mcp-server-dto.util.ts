import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { type McpServerDTO } from 'src/engine/metadata-modules/mcp-server/dtos/mcp-server.dto';

export const fromFlatMcpServerToMcpServerDto = (
  flatMcpServer: FlatMcpServer,
): McpServerDTO => ({
  id: flatMcpServer.id,
  name: flatMcpServer.name,
  label: flatMcpServer.label,
  url: flatMcpServer.url,
  connectionProviderId: flatMcpServer.connectionProviderId,
  isActive: flatMcpServer.isActive,
  workspaceId: flatMcpServer.workspaceId,
  applicationId: flatMcpServer.applicationId,
  createdAt: new Date(flatMcpServer.createdAt),
  updatedAt: new Date(flatMcpServer.updatedAt),
});
