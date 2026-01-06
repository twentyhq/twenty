import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatDatabaseEventTriggerMaps')
export class WorkspaceFlatDatabaseEventTriggerMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatDatabaseEventTrigger>
> {
  constructor(
    @InjectRepository(DatabaseEventTriggerEntity)
    private readonly databaseEventTriggerRepository: Repository<DatabaseEventTriggerEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatDatabaseEventTrigger>> {
    const databaseEventTriggers =
      await this.databaseEventTriggerRepository.find({
        where: {
          workspaceId,
        },
      });

    const flatDatabaseEventTriggerMaps = createEmptyFlatEntityMaps();

    for (const databaseEventTriggerEntity of databaseEventTriggers) {
      const flatDatabaseEventTrigger = {
        ...removePropertiesFromRecord(
          databaseEventTriggerEntity,
          getMetadataEntityRelationProperties('databaseEventTrigger'),
        ),
        universalIdentifier:
          databaseEventTriggerEntity.universalIdentifier ??
          databaseEventTriggerEntity.id,
        createdAt: databaseEventTriggerEntity.createdAt.toISOString(),
        updatedAt: databaseEventTriggerEntity.updatedAt.toISOString(),
      } satisfies FlatDatabaseEventTrigger;

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatDatabaseEventTrigger,
        flatEntityMapsToMutate: flatDatabaseEventTriggerMaps,
      });
    }

    return flatDatabaseEventTriggerMaps;
  }
}
