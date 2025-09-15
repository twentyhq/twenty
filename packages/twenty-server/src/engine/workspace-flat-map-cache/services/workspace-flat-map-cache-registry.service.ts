import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { WORKSPACE_FLAT_MAP_CACHE_KEY } from '../decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from './workspace-flat-map-cache.service';

@Injectable()
export class WorkspaceFlatMapCacheRegistryService implements OnModuleInit {
  private readonly cacheServiceMap = new Map<
    keyof AllFlatEntityMaps,
    WorkspaceFlatMapCacheService<any>
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
  ): WorkspaceFlatMapCacheService<any> | undefined {
    return this.cacheServiceMap.get(flatEntityName);
  }

  getAllCacheServices(): Map<
    keyof AllFlatEntityMaps,
    WorkspaceFlatMapCacheService<any>
  > {
    return new Map(this.cacheServiceMap);
  }
}
