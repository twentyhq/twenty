import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import {
  CRON_TRIGGER_ENTITY_RELATION_PROPERTIES,
  CronTrigger,
} from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
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
    @InjectRepository(CronTrigger)
    private readonly cronTriggerRepository: Repository<CronTrigger>,
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

    const flatCronTriggerMaps = cronTriggers.reduce<
      FlatEntityMaps<FlatCronTrigger>
    >((flatEntityMaps, cronTrigger) => {
      const flatCronTrigger = {
        ...removePropertiesFromRecord(cronTrigger, [
          ...CRON_TRIGGER_ENTITY_RELATION_PROPERTIES,
        ]),
        universalIdentifier: cronTrigger.universalIdentifier ?? cronTrigger.id,
      } satisfies FlatCronTrigger;

      return {
        byId: {
          ...flatEntityMaps.byId,
          [flatCronTrigger.id]: flatCronTrigger,
        },
        idByUniversalIdentifier: {
          ...flatEntityMaps.idByUniversalIdentifier,
          [flatCronTrigger.universalIdentifier]: flatCronTrigger.id,
        },
      };
    }, EMPTY_FLAT_ENTITY_MAPS);

    return flatCronTriggerMaps;
  }
}
