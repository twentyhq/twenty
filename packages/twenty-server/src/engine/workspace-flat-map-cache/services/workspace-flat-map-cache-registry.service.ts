import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { WORKSPACE_FLAT_MAP_CACHE_KEY } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
export class WorkspaceFlatMapCacheRegistryService implements OnModuleInit {
  private readonly cacheServiceMap = new Map<
    keyof AllFlatEntityMaps,
    WorkspaceFlatMapCacheService<FlatEntityMaps<AllFlatEntities>>
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.discoverAndRegisterCacheServices();
  }

  private discoverAndRegisterCacheServices(): void {
    const providers = this.discoveryService.getProviders();

    providers.forEach((wrapper) => {
      const { instance, metatype } = wrapper;

      if (!instance || !metatype) {
        return;
      }

      const cacheKey = Reflect.getMetadata(
        WORKSPACE_FLAT_MAP_CACHE_KEY,
        metatype,
      );

      if (cacheKey && instance instanceof WorkspaceFlatMapCacheService) {
        this.cacheServiceMap.set(cacheKey, instance);
      }
    });
  }

  getCacheService(
    flatEntityName: keyof AllFlatEntityMaps,
  ): WorkspaceFlatMapCacheService<FlatEntityMaps<AllFlatEntities>> | undefined {
    return this.cacheServiceMap.get(flatEntityName);
  }

  getAllCacheServices(): Map<
    keyof AllFlatEntityMaps,
    WorkspaceFlatMapCacheService<FlatEntityMaps<AllFlatEntities>>
  > {
    return new Map(this.cacheServiceMap);
  }
}
