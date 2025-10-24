import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  CRON_TRIGGER_ENTITY_RELATION_PROPERTIES,
  CronTriggerEntity,
} from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('flatCronTriggerMaps')
export class WorkspaceFlatCronTriggerMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatCronTrigger>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(CronTriggerEntity)
    private readonly cronTriggerRepository: Repository<CronTriggerEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatCronTrigger>> {
    const cronTriggers = await this.cronTriggerRepository.find({
      where: {
        workspaceId,
      },
    });

    return cronTriggers.reduce((flatCronTriggerMaps, cronTriggerEntity) => {
      const flatCronTrigger = {
        ...removePropertiesFromRecord(cronTriggerEntity, [
          ...CRON_TRIGGER_ENTITY_RELATION_PROPERTIES,
        ]),
        universalIdentifier:
          cronTriggerEntity.universalIdentifier ?? cronTriggerEntity.id,
      } satisfies FlatCronTrigger;

      return addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatCronTrigger,
        flatEntityMaps: flatCronTriggerMaps,
      });
    }, EMPTY_FLAT_ENTITY_MAPS);
  }
}
