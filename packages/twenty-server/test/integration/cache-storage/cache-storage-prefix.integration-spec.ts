import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { caching } from 'cache-manager';
import { type RedisCache, redisStore } from 'cache-manager-redis-yet';
import { randomUUID } from 'crypto';

import { FlushCacheCommand } from 'src/engine/core-modules/cache-storage/commands/flush-cache.command';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/twenty-config/constants/config-variables-instance-tokens.constants';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('Cache storage prefix', () => {
  let cache: RedisCache;
  let entriesToClean: { storage: CacheStorageService; key: string }[];

  beforeAll(async () => {
    cache = await caching(
      await redisStore({ url: process.env.REDIS_URL, ttl: 60_000 }),
    );
  });

  beforeEach(() => {
    entriesToClean = [];
  });

  afterEach(async () => {
    await Promise.all(
      entriesToClean.map(({ storage, key }) => storage.del(key)),
    );
  });

  afterAll(async () => {
    await cache.store.client.quit();
  });

  describe.each([
    { prefix: '', otherPrefix: '{other-cache}' },
    { prefix: '{twenty-cache}', otherPrefix: '{other-cache}' },
    { prefix: '{twenty[prod]}', otherPrefix: '{twentyp}' },
    { prefix: '{twenty*}', otherPrefix: '{twenty-other}' },
    { prefix: '{twenty?}', otherPrefix: '{twentyX}' },
    { prefix: '{twenty\\prod}', otherPrefix: '{twentyprod}' },
    { prefix: '{twenty]prod}', otherPrefix: '{twentyprod}' },
  ])('cache:flush with prefix "$prefix"', ({ prefix, otherPrefix }) => {
    let module: TestingModule;

    beforeAll(async () => {
      module = await Test.createTestingModule({
        providers: [
          { provide: CACHE_MANAGER, useValue: cache },
          {
            provide: ConfigService,
            useValue: new ConfigService({
              REDIS_CACHE_PREFIX: prefix,
              IS_CONFIG_VARIABLES_IN_DB_ENABLED: false,
            }),
          },
          {
            provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
            useValue: new ConfigVariables(),
          },
          EnvironmentConfigDriver,
          TwentyConfigService,
          FlushCacheCommand,
        ],
      }).compile();
    });

    afterAll(async () => {
      await module.close();
    });

    it('matches the suffix pattern while preserving other prefixes and namespaces', async () => {
      const storage = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
        prefix,
      );
      const otherPrefixStorage = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineWorkspace,
        otherPrefix,
      );
      const otherNamespaceStorage = new CacheStorageService(
        cache,
        CacheStorageNamespace.EngineCoreEntity,
        prefix,
      );
      const keyRoot = `cache-prefix:${randomUUID()}`;
      const matchingKeys = [`${keyRoot}:a1:data`, `${keyRoot}:b2:data`];
      const nonMatchingKey = `${keyRoot}:c3:data`;

      entriesToClean = [
        ...[...matchingKeys, nonMatchingKey].map((key) => ({ storage, key })),
        { storage: otherPrefixStorage, key: matchingKeys[0] },
        { storage: otherNamespaceStorage, key: matchingKeys[0] },
      ];
      await Promise.all(
        entriesToClean.map(({ storage: entryStorage, key }) =>
          entryStorage.set(key, 'cached'),
        ),
      );

      await module.get(FlushCacheCommand).run([], {
        namespace: CacheStorageNamespace.EngineWorkspace,
        pattern: `${keyRoot}:[ab]?:data`,
      });

      expect(await storage.mget(matchingKeys)).toEqual([undefined, undefined]);
      expect(await storage.get(nonMatchingKey)).toBe('cached');
      expect(await otherPrefixStorage.get(matchingKeys[0])).toBe('cached');
      expect(await otherNamespaceStorage.get(matchingKeys[0])).toBe('cached');
    });
  });
});
