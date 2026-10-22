import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';

export type FlatMcpServer = FlatEntityFrom<McpServerEntity>;
