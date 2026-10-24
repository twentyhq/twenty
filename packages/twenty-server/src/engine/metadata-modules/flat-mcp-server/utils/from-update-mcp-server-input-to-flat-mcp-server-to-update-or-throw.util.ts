import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_MCP_SERVER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-mcp-server/constants/flat-mcp-server-editable-properties.constant';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateMcpServerInputToFlatMcpServerToUpdateOrThrow = ({
  flatMcpServerMaps,
  mcpServerId,
  update,
}: {
  flatMcpServerMaps: FlatEntityMaps<FlatMcpServer>;
  mcpServerId: string;
  update: Partial<
    Pick<FlatMcpServer, (typeof FLAT_MCP_SERVER_EDITABLE_PROPERTIES)[number]>
  >;
}): FlatMcpServer => {
  const existingFlatMcpServer = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: mcpServerId,
    flatEntityMaps: flatMcpServerMaps,
  });

  if (!isDefined(existingFlatMcpServer)) {
    throw new McpServerException(
      'MCP server not found',
      McpServerExceptionCode.MCP_SERVER_NOT_FOUND,
    );
  }

  return {
    ...mergeUpdateInExistingRecord({
      existing: existingFlatMcpServer,
      properties: [...FLAT_MCP_SERVER_EDITABLE_PROPERTIES],
      update,
    }),
    updatedAt: new Date().toISOString(),
  };
};
