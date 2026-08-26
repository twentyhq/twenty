import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { transformAgentEntityToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/transform-agent-entity-to-flat-agent.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_AGENT_ROWS_REQUIREMENT = {
  agent: true,
  application: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatAgentMaps', { packingPonderation: 1 })
export class WorkspaceFlatAgentMapCacheService extends MetadataFlatEntityMapsCacheProvider<'agent'> {
  override readonly rowsRequirement = FLAT_AGENT_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_AGENT_ROWS_REQUIREMENT
  >): FlatAgentMaps {
    const { agent: agents, application: applications } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatAgentMaps = createEmptyFlatEntityMaps();

    for (const agentEntity of agents) {
      const flatAgent = transformAgentEntityToFlatAgent({
        entity: agentEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatAgent,
        flatEntityMapsToMutate: flatAgentMaps,
      });
    }

    return flatAgentMaps;
  }
}
