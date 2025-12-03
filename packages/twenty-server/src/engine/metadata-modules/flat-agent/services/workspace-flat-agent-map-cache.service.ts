import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { transformAgentEntityToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/transform-agent-entity-to-flat-agent.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatAgentMaps')
export class WorkspaceFlatAgentMapCacheService extends WorkspaceCacheProvider<FlatAgentMaps> {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatAgentMaps> {
    const agents = await this.agentRepository.find({
      where: { workspaceId },
      withDeleted: true,
    });

    const flatAgentMaps = createEmptyFlatEntityMaps();

    for (const agentEntity of agents) {
      const flatAgent = transformAgentEntityToFlatAgent(agentEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatAgent,
        flatEntityMapsToMutate: flatAgentMaps,
      });
    }

    return flatAgentMaps;
  }
}
