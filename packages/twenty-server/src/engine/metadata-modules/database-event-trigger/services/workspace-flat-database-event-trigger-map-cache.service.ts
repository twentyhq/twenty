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
  DATABASE_EVENT_TRIGGER_ENTITY_RELATION_PROPERTIES,
  DatabaseEventTrigger,
} from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('flatDatabaseEventTriggerMaps')
export class WorkspaceFlatDatabaseEventTriggerMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatDatabaseEventTrigger>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(DatabaseEventTrigger)
    private readonly databaseEventTriggerRepository: Repository<DatabaseEventTrigger>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatDatabaseEventTrigger>> {
    const databaseEventTriggers =
      await this.databaseEventTriggerRepository.find({
        where: {
          workspaceId,
        },
      });

    const flatDatabaseEventTriggerMaps = databaseEventTriggers.reduce<
      FlatEntityMaps<FlatDatabaseEventTrigger>
    >((flatEntityMaps, databaseEventTrigger) => {
      const flatDatabaseEventTrigger = {
        ...removePropertiesFromRecord(databaseEventTrigger, [
          ...DATABASE_EVENT_TRIGGER_ENTITY_RELATION_PROPERTIES,
        ]),
        universalIdentifier: databaseEventTrigger.universalIdentifier ?? '',
      } satisfies FlatDatabaseEventTrigger;

      return {
        byId: {
          ...flatEntityMaps.byId,
          [flatDatabaseEventTrigger.id]: flatDatabaseEventTrigger,
        },
        idByUniversalIdentifier: {
          ...flatEntityMaps.idByUniversalIdentifier,
          [flatDatabaseEventTrigger.universalIdentifier]:
            flatDatabaseEventTrigger.id,
        },
      };
    }, EMPTY_FLAT_ENTITY_MAPS);

    return flatDatabaseEventTriggerMaps;
  }
}
