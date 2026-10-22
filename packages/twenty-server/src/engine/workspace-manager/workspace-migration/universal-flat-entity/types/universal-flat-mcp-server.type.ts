import { type McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatMcpServer = UniversalFlatEntityFrom<
  McpServerEntity,
  'mcpServer'
>;
