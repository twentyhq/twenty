import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';

export const findFlatMcpServerByIdOrThrow = ({
  flatMcpServerMaps,
  mcpServerId,
}: {
  flatMcpServerMaps: FlatEntityMaps<FlatMcpServer>;
  mcpServerId: string;
}): FlatMcpServer => {
  const flatMcpServer = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: mcpServerId,
    flatEntityMaps: flatMcpServerMaps,
  });

  if (!isDefined(flatMcpServer)) {
    throw new McpServerException(
      'MCP server not found',
      McpServerExceptionCode.MCP_SERVER_NOT_FOUND,
    );
  }

  return flatMcpServer;
};
