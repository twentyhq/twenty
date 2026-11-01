import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatMcpServerMaps } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server-maps.type';
import { fromMcpServerEntityToFlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/utils/from-mcp-server-entity-to-flat-mcp-server.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_MCP_SERVER_ROWS_REQUIREMENT = {
  mcpServer: true,
  application: ['id', 'universalIdentifier'],
  connectionProvider: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatMcpServerMaps', { packingPonderation: 1 })
export class WorkspaceFlatMcpServerMapCacheService extends MetadataFlatEntityMapsCacheProvider<'mcpServer'> {
  override readonly rowsRequirement = FLAT_MCP_SERVER_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_MCP_SERVER_ROWS_REQUIREMENT
  >): FlatMcpServerMaps {
    const {
      mcpServer: mcpServers,
      application: applications,
      connectionProvider: connectionProviders,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const connectionProviderIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(connectionProviders);

    const flatMcpServerMaps = createEmptyFlatEntityMaps();

    for (const mcpServerEntity of mcpServers) {
      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: fromMcpServerEntityToFlatMcpServer({
          entity: mcpServerEntity,
          applicationIdToUniversalIdentifierMap,
          connectionProviderIdToUniversalIdentifierMap,
        }),
        flatEntityMapsToMutate: flatMcpServerMaps,
      });
    }

    return flatMcpServerMaps;
  }
}
