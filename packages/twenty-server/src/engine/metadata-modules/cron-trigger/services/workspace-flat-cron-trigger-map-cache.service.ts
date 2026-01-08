import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatCronTriggerMaps')
export class WorkspaceFlatCronTriggerMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatCronTrigger>
> {
  constructor(
    @InjectRepository(CronTriggerEntity)
    private readonly cronTriggerRepository: Repository<CronTriggerEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatCronTrigger>> {
    const cronTriggers = await this.cronTriggerRepository.find({
      where: {
        workspaceId,
      },
    });

    const flatCronTriggerMaps = createEmptyFlatEntityMaps();

    for (const cronTriggerEntity of cronTriggers) {
      const flatCronTrigger = {
        ...removePropertiesFromRecord(
          cronTriggerEntity,
          getMetadataEntityRelationProperties('cronTrigger'),
        ),
        universalIdentifier:
          cronTriggerEntity.universalIdentifier ?? cronTriggerEntity.id,
        createdAt: cronTriggerEntity.createdAt.toISOString(),
        updatedAt: cronTriggerEntity.updatedAt.toISOString(),
      } satisfies FlatCronTrigger;

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatCronTrigger,
        flatEntityMapsToMutate: flatCronTriggerMaps,
      });
    }

    return flatCronTriggerMaps;
  }
}
