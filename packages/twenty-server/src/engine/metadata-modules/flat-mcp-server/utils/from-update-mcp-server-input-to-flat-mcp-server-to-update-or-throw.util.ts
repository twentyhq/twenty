import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FLAT_MCP_SERVER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-mcp-server/constants/flat-mcp-server-editable-properties.constant';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { findFlatMcpServerByIdOrThrow } from 'src/engine/metadata-modules/flat-mcp-server/utils/find-flat-mcp-server-by-id-or-throw.util';
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
  return {
    ...mergeUpdateInExistingRecord({
      existing: findFlatMcpServerByIdOrThrow({
        flatMcpServerMaps,
        mcpServerId,
      }),
      properties: [...FLAT_MCP_SERVER_EDITABLE_PROPERTIES],
      update,
    }),
    updatedAt: new Date().toISOString(),
  };
};
