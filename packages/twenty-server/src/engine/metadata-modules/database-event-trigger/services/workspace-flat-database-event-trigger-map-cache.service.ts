import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  DATABASE_EVENT_TRIGGER_ENTITY_RELATION_PROPERTIES,
  DatabaseEventTrigger,
} from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
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

    return databaseEventTriggers.reduce(
      (flatDatabaseEventTriggerMaps, databaseEventTriggerEntity) => {
        const flatDatabaseEventTrigger = {
          ...removePropertiesFromRecord(databaseEventTriggerEntity, [
            ...DATABASE_EVENT_TRIGGER_ENTITY_RELATION_PROPERTIES,
          ]),
          universalIdentifier:
            databaseEventTriggerEntity.universalIdentifier ??
            databaseEventTriggerEntity.id,
        } satisfies FlatDatabaseEventTrigger;

        return addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatDatabaseEventTrigger,
          flatEntityMaps: flatDatabaseEventTriggerMaps,
        });
      },
      EMPTY_FLAT_ENTITY_MAPS,
    );
  }
}
