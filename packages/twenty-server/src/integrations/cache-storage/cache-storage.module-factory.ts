import { CacheModuleOptions } from '@nestjs/common';

import { redisStore } from 'cache-manager-redis-yet';

import { CacheStorageType } from 'src/integrations/cache-storage/types/cache-storage-type.enum';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

export const cacheStorageModuleFactory = (
  environmentService: EnvironmentService,
): CacheModuleOptions => {
  const storageType = environmentService.getCacheStorageType();
  const cacheTtl = environmentService.getCacheTtl();
  const cacheModuleOptions: CacheModuleOptions = {
    isGlobal: true,
    ttl: cacheTtl * 1000,
  };

  switch (storageType) {
    case CacheStorageType.Memory: {
      return cacheModuleOptions;
    }
    case CacheStorageType.Redis: {
      const host = environmentService.getRedisHost();
      const port = environmentService.getRedisPort();

      if (!(host && port)) {
        throw new Error(
          `${storageType} cache storage requires host: ${host} and port: ${port} to be defined, check your .env file`,
        );
      }

      return {
        ...cacheModuleOptions,
        store: redisStore,
        socket: {
          host,
          port,
        },
      };
    }
    default:
      throw new Error(
        `Invalid cache-storage (${storageType}), check your .env file`,
      );
  }
};
