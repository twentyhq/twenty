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
  ROUTE_ENTITY_RELATION_PROPERTIES,
  Route,
} from 'src/engine/metadata-modules/route/route.entity';
import { FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('flatRouteMaps')
export class WorkspaceFlatRouteMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatRoute>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatRoute>> {
    const routes = await this.routeRepository.find({
      where: {
        workspaceId,
      },
    });

    const flatRouteMaps = routes.reduce<FlatEntityMaps<FlatRoute>>(
      (flatEntityMaps, route) => {
        const flatRoute = {
          ...removePropertiesFromRecord(route, [
            ...ROUTE_ENTITY_RELATION_PROPERTIES,
          ]),
          universalIdentifier: route.universalIdentifier ?? '',
        } satisfies FlatRoute;

        return {
          byId: {
            ...flatEntityMaps.byId,
            [flatRoute.id]: flatRoute,
          },
          idByUniversalIdentifier: {
            ...flatEntityMaps.idByUniversalIdentifier,
            [flatRoute.universalIdentifier]: flatRoute.id,
          },
        };
      },
      EMPTY_FLAT_ENTITY_MAPS,
    );

    return flatRouteMaps;
  }
}
