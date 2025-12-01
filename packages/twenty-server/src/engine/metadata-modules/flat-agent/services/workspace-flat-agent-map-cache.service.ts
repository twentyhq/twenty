import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatAgentMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-agent-maps.type';
import { transformAgentEntityToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/transform-agent-entity-to-flat-agent.util';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatAgentMaps')
export class WorkspaceFlatAgentMapCacheService extends WorkspaceFlatMapCacheService<FlatAgentMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatAgentMaps> {
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
