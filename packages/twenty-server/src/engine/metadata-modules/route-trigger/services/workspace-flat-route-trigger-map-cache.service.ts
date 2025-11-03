import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  ROUTE_TRIGGER_ENTITY_RELATION_PROPERTIES,
  RouteTriggerEntity,
} from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatRouteTriggerMaps')
export class WorkspaceFlatRouteTriggerMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatRouteTrigger>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(RouteTriggerEntity)
    private readonly routeTriggerRepository: Repository<RouteTriggerEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatRouteTrigger>> {
    const routeTriggers = await this.routeTriggerRepository.find({
      where: {
        workspaceId,
      },
    });

    const flatRouteTriggerMaps = createEmptyFlatEntityMaps();

    for (const routeTriggerEntity of routeTriggers) {
      const flatRouteTrigger = {
        ...removePropertiesFromRecord(routeTriggerEntity, [
          ...ROUTE_TRIGGER_ENTITY_RELATION_PROPERTIES,
        ]),
        universalIdentifier:
          routeTriggerEntity.universalIdentifier ?? routeTriggerEntity.id,
      } satisfies FlatRouteTrigger;

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRouteTrigger,
        flatEntityMapsToMutate: flatRouteTriggerMaps,
      });
    }

    return flatRouteTriggerMaps;
  }
}
