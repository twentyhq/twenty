import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { WORKSPACE_FLAT_MAP_CACHE_KEY } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import {
  WorkspaceFlatMapCacheException,
  WorkspaceFlatMapCacheExceptionCode,
} from 'src/engine/workspace-flat-map-cache/exceptions/workspace-flat-map-cache.exception';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
export class WorkspaceFlatMapCacheRegistryService implements OnModuleInit {
  private readonly cacheServiceRecord: {
    [P in keyof AllFlatEntityMaps]?: WorkspaceFlatMapCacheService<
      AllFlatEntityMaps[P]
    >;
  } = {};

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

      const cacheKey: keyof AllFlatEntityMaps | undefined = Reflect.getMetadata(
        WORKSPACE_FLAT_MAP_CACHE_KEY,
        metatype,
      );

      if (cacheKey && instance instanceof WorkspaceFlatMapCacheService) {
        this.cacheServiceRecord[cacheKey] = instance;
      }
    });
  }

  getCacheService<K extends keyof AllFlatEntityMaps>(flatMapsKey: K) {
    return this.cacheServiceRecord[flatMapsKey];
  }

  getCacheServiceOrThrow<K extends keyof AllFlatEntityMaps>(flatMapsKey: K) {
    const service = this.getCacheService(flatMapsKey);

    if (!isDefined(service)) {
      throw new WorkspaceFlatMapCacheException(
        `No cache service found for ${flatMapsKey}`,
        WorkspaceFlatMapCacheExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    return service;
  }
}
