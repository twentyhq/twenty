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
  ROUTE_TRIGGER_ENTITY_RELATION_PROPERTIES,
  RouteTrigger,
} from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('flatRouteTriggerMaps')
export class WorkspaceFlatRouteTriggerMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatRouteTrigger>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(RouteTrigger)
    private readonly routeTriggerRepository: Repository<RouteTrigger>,
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

    const flatRouteTriggerMaps = routeTriggers.reduce<
      FlatEntityMaps<FlatRouteTrigger>
    >((flatEntityMaps, routeTrigger) => {
      const flatRouteTrigger = {
        ...removePropertiesFromRecord(routeTrigger, [
          ...ROUTE_TRIGGER_ENTITY_RELATION_PROPERTIES,
        ]),
        universalIdentifier: routeTrigger.universalIdentifier ?? '',
      } satisfies FlatRouteTrigger;

      return {
        byId: {
          ...flatEntityMaps.byId,
          [flatRouteTrigger.id]: flatRouteTrigger,
        },
        idByUniversalIdentifier: {
          ...flatEntityMaps.idByUniversalIdentifier,
          [flatRouteTrigger.universalIdentifier]: flatRouteTrigger.id,
        },
      };
    }, EMPTY_FLAT_ENTITY_MAPS);

    return flatRouteTriggerMaps;
  }
}
