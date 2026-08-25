import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { transformAgentEntityToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/transform-agent-entity-to-flat-agent.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatAgentMaps', { packingPonderation: 1 })
export class WorkspaceFlatAgentMapCacheService extends WorkspaceCacheProvider<FlatAgentMaps> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<FlatAgentMaps> {
    const [agents, applications] = await Promise.all([
      recomputeContext.findAll(AgentEntity),
      recomputeContext.findAll(ApplicationEntity, [
        'id',
        'universalIdentifier',
      ]),
    ]);

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
