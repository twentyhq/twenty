import { DiscoveryService, Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import * as Sentry from '@sentry/node';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  WORKSPACE_CACHE_KEY,
  WORKSPACE_CACHE_OPTIONS,
} from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

jest.mock('@sentry/node', () => ({
  startSpan: jest.fn(),
}));

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

class MockFeatureFlagsCacheProvider extends WorkspaceCacheProvider<{
  testData: string;
}> {
  async computeForCache(_workspaceId: string) {
    return { testData: 'computed-value' };
  }
}

class MockRolesPermissionsCacheProvider extends WorkspaceCacheProvider<{
  testData: string;
}> {
  async computeForCache(_workspaceId: string) {
    return { testData: 'computed-value' };
  }
}

class MockOrmEntityMetadatasCacheProvider extends WorkspaceCacheProvider<{
  testData: string;
}> {
  async computeForCache(_workspaceId: string) {
    return { testData: 'orm-computed-value' };
  }
}

describe('WorkspaceCacheService', () => {
  let service: WorkspaceCacheService;
  let cacheStorageService: jest.Mocked<CacheStorageService>;
  let discoveryService: jest.Mocked<DiscoveryService>;
  let reflector: jest.Mocked<Reflector>;
  let mockProvider: MockFeatureFlagsCacheProvider;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest
      .mocked(Sentry.startSpan)
      .mockImplementation((_options, callback) => callback({} as never));

    mockProvider = new MockFeatureFlagsCacheProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceCacheService,
        {
          provide: CacheStorageNamespace.EngineWorkspace,
          useValue: {
            mget: jest.fn(),
            mset: jest.fn(),
            mdel: jest.fn(),
            setIfAbsent: jest.fn(),
          },
        },
        {
          provide: DiscoveryService,
          useValue: {
            getProviders: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: MetricsService,
          useValue: {
            incrementCounterBy: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(604800),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceCacheService>(WorkspaceCacheService);
    cacheStorageService = module.get(CacheStorageNamespace.EngineWorkspace);
    discoveryService = module.get(DiscoveryService);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should register workspace cache providers', async () => {
      discoveryService.getProviders.mockReturnValue([
        { instance: mockProvider },
      ] as any);

      reflector.get.mockImplementation((key, target) => {
        if (
          key === WORKSPACE_CACHE_KEY &&
          target === MockFeatureFlagsCacheProvider
        ) {
          return 'featureFlagsMap';
        }

        return undefined;
      });

      await service.onModuleInit();

      expect(discoveryService.getProviders).toHaveBeenCalled();
      expect(reflector.get).toHaveBeenCalled();
    });

    it('should skip non-object instances', async () => {
      discoveryService.getProviders.mockReturnValue([
        { instance: null },
        { instance: undefined },
        { instance: 'string-value' },
      ] as any);

      await service.onModuleInit();

      expect(reflector.get).not.toHaveBeenCalled();
    });

    it('should skip instances without workspace cache key metadata', async () => {
      discoveryService.getProviders.mockReturnValue([
        { instance: mockProvider },
      ] as any);

      reflector.get.mockReturnValue(undefined);

      await service.onModuleInit();

      expect(reflector.get).toHaveBeenCalled();
    });
  });

  describe('getOrRecompute', () => {
    beforeEach(async () => {
      discoveryService.getProviders.mockReturnValue([
        { instance: mockProvider },
      ] as any);

      reflector.get.mockImplementation((key, target) => {
        if (
          key === WORKSPACE_CACHE_KEY &&
          target === MockFeatureFlagsCacheProvider
        ) {
          return 'featureFlagsMap';
        }

        return undefined;
      });

      await service.onModuleInit();
    });

    it('should compute and cache data when redis cache is empty', async () => {
      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.mset.mockResolvedValue(undefined);

      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue({
        testData: 'fresh-computed-value',
      });

      const result = await service.getOrRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
      ]);

      expect(result).toEqual({
        featureFlagsMap: { testData: 'fresh-computed-value' },
      });
      expect(mockProvider.computeForCache).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(cacheStorageService.mset).toHaveBeenCalled();
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: 'compute workspace metadata cache entry from provider',
          op: 'cache.recompute',
          onlyIfParent: true,
          attributes: {
            'cache.key_name': 'featureFlagsMap',
            'cache.recompute.strategy': 'recover',
            'cache.local_data_only': false,
          },
        },
        expect.any(Function),
      );
    });

    it('should return data from redis when available', async () => {
      const cachedData = { FLAG_A: true, FLAG_B: false };
      const cachedHash = 'some-hash-from-redis';

      cacheStorageService.mget
        // First call: validateLocalHashAgainstRedisHash checks hash
        .mockResolvedValueOnce([undefined])
        // Second call: fetchDataFromRedis fetches data and hash atomically
        .mockResolvedValueOnce([cachedData, cachedHash]);

      const result = await service.getOrRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
      ]);

      expect(result).toEqual({ featureFlagsMap: cachedData });
      expect(Sentry.startSpan).not.toHaveBeenCalled();
    });

    it('should use local cache when within TTL staleness window', async () => {
      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.mset.mockResolvedValue(undefined);

      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue({
        testData: 'computed-value',
      });

      await service.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      jest.advanceTimersByTime(50);

      const result = await service.getOrRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
      ]);

      expect(result).toEqual({
        featureFlagsMap: { testData: 'computed-value' },
      });

      expect(mockProvider.computeForCache).toHaveBeenCalledTimes(1);
    });

    it('should recheck redis when local cache exceeds TTL staleness window', async () => {
      const initialData = { testData: 'initial-value' };
      const updatedData = { testData: 'updated-value' };

      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.mset.mockResolvedValue(undefined);

      jest
        .spyOn(mockProvider, 'computeForCache')
        .mockResolvedValue(initialData);

      await service.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      // Advance past the local staleness TTL (100ms) and memoizer TTL (10s)
      jest.advanceTimersByTime(15_000);

      cacheStorageService.mget.mockResolvedValue([updatedData]);

      jest
        .spyOn(mockProvider, 'computeForCache')
        .mockResolvedValue(updatedData);

      await service.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      // Verify Redis was rechecked after TTL expired
      // Each getOrRecompute triggers: 1 hash check + 1 atomic data/hash fetch = 2 mget calls
      // Total: 4 mget calls (2 per getOrRecompute)
      expect(cacheStorageService.mget).toHaveBeenCalledTimes(4);
    });
  });

  describe('invalidateAndRecompute', () => {
    beforeEach(async () => {
      discoveryService.getProviders.mockReturnValue([
        { instance: mockProvider },
      ] as any);

      reflector.get.mockImplementation((key, target) => {
        if (
          key === WORKSPACE_CACHE_KEY &&
          target === MockFeatureFlagsCacheProvider
        ) {
          return 'featureFlagsMap';
        }

        return undefined;
      });

      await service.onModuleInit();
    });

    it('should delete from redis, mark local cache as stale, and recompute', async () => {
      cacheStorageService.mdel.mockResolvedValue(undefined);
      cacheStorageService.mset.mockResolvedValue(undefined);

      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue({
        testData: 'recomputed-value',
      });

      await service.invalidateAndRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      expect(cacheStorageService.mdel).toHaveBeenCalledWith([
        'feature-flag:feature-flags-map:20202020-0000-4000-8000-000000000000:data',
        'feature-flag:feature-flags-map:20202020-0000-4000-8000-000000000000:hash',
      ]);
      expect(mockProvider.computeForCache).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(cacheStorageService.mset).toHaveBeenCalled();
      expect(Sentry.startSpan).toHaveBeenCalledWith(
        {
          name: 'invalidate and recompute workspace metadata cache',
          op: 'cache.invalidate',
          onlyIfParent: true,
          attributes: { 'cache.key_count': 1 },
        },
        expect.any(Function),
      );
    });

    it('should invalidate multiple cache keys at once', async () => {
      const secondMockProvider = new MockRolesPermissionsCacheProvider();

      discoveryService.getProviders.mockReturnValue([
        { instance: mockProvider },
        { instance: secondMockProvider },
      ] as any);

      reflector.get.mockImplementation((key, target) => {
        if (key === WORKSPACE_CACHE_KEY) {
          if (target === MockFeatureFlagsCacheProvider) {
            return 'featureFlagsMap';
          }
          if (target === MockRolesPermissionsCacheProvider) {
            return 'rolesPermissions';
          }
        }

        return undefined;
      });

      await service.onModuleInit();

      cacheStorageService.mdel.mockResolvedValue(undefined);
      cacheStorageService.mset.mockResolvedValue(undefined);

      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue({
        testData: 'recomputed-value',
      });
      jest.spyOn(secondMockProvider, 'computeForCache').mockResolvedValue({
        testData: 'recomputed-value',
      });

      await service.invalidateAndRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
        'rolesPermissions',
      ]);

      expect(cacheStorageService.mdel).toHaveBeenCalledWith(
        expect.arrayContaining([
          'feature-flag:feature-flags-map:20202020-0000-4000-8000-000000000000:data',
          'feature-flag:feature-flags-map:20202020-0000-4000-8000-000000000000:hash',
          'metadata:permissions:roles-permissions:20202020-0000-4000-8000-000000000000:data',
          'metadata:permissions:roles-permissions:20202020-0000-4000-8000-000000000000:hash',
        ]),
      );
    });

    it('should keep old versions in local cache after invalidation for race condition safety', async () => {
      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.mset.mockResolvedValue(undefined);
      cacheStorageService.mdel.mockResolvedValue(undefined);

      const initialData = { testData: 'initial-value' };
      const recomputedData = { testData: 'recomputed-value' };

      jest
        .spyOn(mockProvider, 'computeForCache')
        .mockResolvedValue(initialData);

      // First, populate the cache
      const firstResult = await service.getOrRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
      ]);

      expect(firstResult).toEqual({ featureFlagsMap: initialData });

      // Now invalidate and recompute
      jest
        .spyOn(mockProvider, 'computeForCache')
        .mockResolvedValue(recomputedData);

      await service.invalidateAndRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      // The new value should be returned
      const secondResult = await service.getOrRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
      ]);

      expect(secondResult).toEqual({ featureFlagsMap: recomputedData });
    });
  });

  describe('flush', () => {
    it('should delete from redis and mark local cache as stale', async () => {
      cacheStorageService.mdel.mockResolvedValue(undefined);

      await service.flush(WORKSPACE_ID, ['featureFlagsMap']);

      expect(cacheStorageService.mdel).toHaveBeenCalledWith([
        'feature-flag:feature-flags-map:20202020-0000-4000-8000-000000000000:data',
        'feature-flag:feature-flags-map:20202020-0000-4000-8000-000000000000:hash',
      ]);
    });

    it('should handle empty cache keys array', async () => {
      cacheStorageService.mdel.mockResolvedValue(undefined);

      await service.flush(WORKSPACE_ID, []);

      expect(cacheStorageService.mdel).toHaveBeenCalledWith([]);
    });

    it('should force staleness on local cache entries without deleting them', async () => {
      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.mset.mockResolvedValue(undefined);
      cacheStorageService.mdel.mockResolvedValue(undefined);

      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue({
        testData: 'computed-value',
      });

      discoveryService.getProviders.mockReturnValue([
        { instance: mockProvider },
      ] as any);

      reflector.get.mockImplementation((key, target) => {
        if (
          key === WORKSPACE_CACHE_KEY &&
          target === MockFeatureFlagsCacheProvider
        ) {
          return 'featureFlagsMap';
        }

        return undefined;
      });

      await service.onModuleInit();

      // Populate the cache
      await service.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      // Flush the cache (marks as stale, doesn't delete)
      await service.flush(WORKSPACE_ID, ['featureFlagsMap']);

      // Advance time slightly (but still within memoizer TTL)
      jest.advanceTimersByTime(50);

      // Next call should check Redis since local cache is marked stale
      cacheStorageService.mget.mockResolvedValue(['some-hash']);

      await service.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      // Should have made additional mget calls to check Redis
      expect(cacheStorageService.mget.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('versioning behavior', () => {
    beforeEach(async () => {
      discoveryService.getProviders.mockReturnValue([
        { instance: mockProvider },
      ] as any);

      reflector.get.mockImplementation((key, target) => {
        if (
          key === WORKSPACE_CACHE_KEY &&
          target === MockFeatureFlagsCacheProvider
        ) {
          return 'featureFlagsMap';
        }

        return undefined;
      });

      await service.onModuleInit();
    });

    it('should store multiple versions when data is recomputed', async () => {
      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.mset.mockResolvedValue(undefined);
      cacheStorageService.mdel.mockResolvedValue(undefined);

      const firstData = { testData: 'first-value' };
      const secondData = { testData: 'second-value' };

      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue(firstData);

      // First computation
      await service.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      // Invalidate and recompute with new data
      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue(secondData);

      await service.invalidateAndRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      // Should return the latest version
      const result = await service.getOrRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
      ]);

      expect(result).toEqual({ featureFlagsMap: secondData });
    });

    it('should cleanup stale versions after TTL expires', async () => {
      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.mset.mockResolvedValue(undefined);
      cacheStorageService.mdel.mockResolvedValue(undefined);

      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue({
        testData: 'value-1',
      });

      // Create first version
      await service.getOrRecompute(WORKSPACE_ID, ['featureFlagsMap']);

      // Create multiple versions by invalidating
      for (let i = 2; i <= 4; i++) {
        jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue({
          testData: `value-${i}`,
        });
        await service.invalidateAndRecompute(WORKSPACE_ID, ['featureFlagsMap']);
      }

      // Advance time past the stale version TTL (5000ms)
      jest.advanceTimersByTime(6_000);

      // Advance past memoizer TTL as well
      jest.advanceTimersByTime(15_000);

      // Trigger a read which should cleanup stale versions
      jest.spyOn(mockProvider, 'computeForCache').mockResolvedValue({
        testData: 'latest-value',
      });

      const result = await service.getOrRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
      ]);

      expect(result).toEqual({ featureFlagsMap: { testData: 'latest-value' } });
    });
  });

  describe('localDataOnly hash recovery', () => {
    let localDataOnlyProvider: MockOrmEntityMetadatasCacheProvider;
    const ormHashKey = `orm:entity-metadatas:${WORKSPACE_ID}:hash`;
    const ormDataKey = `orm:entity-metadatas:${WORKSPACE_ID}:data`;

    beforeEach(async () => {
      localDataOnlyProvider = new MockOrmEntityMetadatasCacheProvider();

      discoveryService.getProviders.mockReturnValue([
        { instance: localDataOnlyProvider },
      ] as any);

      reflector.get.mockImplementation((key, target) => {
        if (target !== MockOrmEntityMetadatasCacheProvider) {
          return undefined;
        }

        if (key === WORKSPACE_CACHE_KEY) {
          return 'ORMEntityMetadatas';
        }

        if (key === WORKSPACE_CACHE_OPTIONS) {
          return { localDataOnly: true };
        }

        return undefined;
      });

      await service.onModuleInit();
    });

    it('should adopt the existing redis hash when recomputing instead of minting a new one', async () => {
      cacheStorageService.mget.mockResolvedValue(['hash-from-another-pod']);
      cacheStorageService.mset.mockResolvedValue(undefined);

      const computeSpy = jest.spyOn(localDataOnlyProvider, 'computeForCache');

      const result = await service.getOrRecompute(WORKSPACE_ID, [
        'ORMEntityMetadatas',
      ]);

      expect(result).toEqual({
        ORMEntityMetadatas: { testData: 'orm-computed-value' },
      });
      expect(computeSpy).toHaveBeenCalledTimes(1);
      expect(cacheStorageService.mset).not.toHaveBeenCalled();
    });

    it('should treat the local copy as valid on later reads after adopting the redis hash', async () => {
      cacheStorageService.mget.mockResolvedValue(['hash-from-another-pod']);
      cacheStorageService.mset.mockResolvedValue(undefined);

      const computeSpy = jest.spyOn(localDataOnlyProvider, 'computeForCache');

      await service.getOrRecompute(WORKSPACE_ID, ['ORMEntityMetadatas']);

      jest.advanceTimersByTime(15_000);

      await service.getOrRecompute(WORKSPACE_ID, ['ORMEntityMetadatas']);

      expect(computeSpy).toHaveBeenCalledTimes(1);
      expect(cacheStorageService.mset).not.toHaveBeenCalled();
    });

    it('should recompute and adopt the new hash when another pod invalidated the key', async () => {
      cacheStorageService.mget.mockResolvedValue(['hash-v1']);
      cacheStorageService.mset.mockResolvedValue(undefined);

      const computeSpy = jest.spyOn(localDataOnlyProvider, 'computeForCache');

      await service.getOrRecompute(WORKSPACE_ID, ['ORMEntityMetadatas']);

      jest.advanceTimersByTime(15_000);

      cacheStorageService.mget.mockResolvedValue(['hash-v2']);

      await service.getOrRecompute(WORKSPACE_ID, ['ORMEntityMetadatas']);

      expect(computeSpy).toHaveBeenCalledTimes(2);
      expect(cacheStorageService.mset).not.toHaveBeenCalled();
    });

    it('should mint a hash and persist it only if still absent when redis has none', async () => {
      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.setIfAbsent.mockResolvedValue(true);

      await service.getOrRecompute(WORKSPACE_ID, ['ORMEntityMetadatas']);

      expect(cacheStorageService.setIfAbsent).toHaveBeenCalledWith(
        ormHashKey,
        expect.any(String),
        604800000,
      );
      expect(cacheStorageService.mset).not.toHaveBeenCalled();
    });

    it('should converge on a hash written concurrently by another pod instead of overwriting it', async () => {
      cacheStorageService.mget.mockResolvedValue([undefined]);
      cacheStorageService.setIfAbsent.mockResolvedValue(false);

      const computeSpy = jest.spyOn(localDataOnlyProvider, 'computeForCache');

      await service.getOrRecompute(WORKSPACE_ID, ['ORMEntityMetadatas']);

      expect(cacheStorageService.setIfAbsent).toHaveBeenCalledTimes(1);
      expect(cacheStorageService.mset).not.toHaveBeenCalled();

      jest.advanceTimersByTime(15_000);

      cacheStorageService.mget.mockResolvedValue(['winner-hash']);

      await service.getOrRecompute(WORKSPACE_ID, ['ORMEntityMetadatas']);

      expect(computeSpy).toHaveBeenCalledTimes(2);
      expect(cacheStorageService.setIfAbsent).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(15_000);

      await service.getOrRecompute(WORKSPACE_ID, ['ORMEntityMetadatas']);

      expect(computeSpy).toHaveBeenCalledTimes(2);
    });

    it('should mint a new hash on invalidateAndRecompute', async () => {
      cacheStorageService.mdel.mockResolvedValue(undefined);
      cacheStorageService.mset.mockResolvedValue(undefined);

      await service.invalidateAndRecompute(WORKSPACE_ID, [
        'ORMEntityMetadatas',
      ]);

      expect(cacheStorageService.mdel).toHaveBeenCalledWith([
        ormDataKey,
        ormHashKey,
      ]);
      expect(cacheStorageService.mset).toHaveBeenCalledWith([
        { key: ormHashKey, value: expect.any(String) },
      ]);
    });
  });
});
