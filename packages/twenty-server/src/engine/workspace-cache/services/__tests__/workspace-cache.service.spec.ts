import { type DiscoveryService, Reflector } from '@nestjs/core';

import { type DataSource } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheMetricsService } from 'src/engine/workspace-cache/services/workspace-cache-metrics.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@WorkspaceCache('apiKeyRoleMap', { packingPonderation: 1 })
class ApiKeyRoleMapTestProvider extends WorkspaceCacheProvider<
  Record<string, string>
> {
  computeForCache(): Record<string, string> {
    return {};
  }
}

@WorkspaceCache('featureFlagsMap', { packingPonderation: 1 })
class FeatureFlagsMapTestProvider extends WorkspaceCacheProvider<
  Record<string, boolean>
> {
  computeForCache(): Record<string, boolean> {
    return {};
  }
}

const WORKSPACE_1_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const WORKSPACE_2_ID = '3b8e6458-5fc1-4e63-8563-008ccddaa6db';

const buildCacheKey = (workspaceId: string, suffix: 'hash' | 'data') =>
  `apiKeyRoleMap:{${workspaceId}}:${suffix}`;

describe('WorkspaceCacheService', () => {
  const redisEntries = new Map<string, unknown>([
    [buildCacheKey(WORKSPACE_1_ID, 'hash'), 'hash-1'],
    [buildCacheKey(WORKSPACE_1_ID, 'data'), { 'api-key-1': 'role-1' }],
    [buildCacheKey(WORKSPACE_2_ID, 'hash'), 'hash-2'],
    [buildCacheKey(WORKSPACE_2_ID, 'data'), { 'api-key-2': 'role-2' }],
  ]);

  let cacheStorage: jest.Mocked<
    Pick<CacheStorageService, 'mget' | 'mset' | 'mdel' | 'del' | 'setIfAbsent'>
  >;
  let service: WorkspaceCacheService;

  const countDataFetches = (workspaceId: string) =>
    cacheStorage.mget.mock.calls.filter(([keys]) =>
      keys.includes(buildCacheKey(workspaceId, 'data')),
    ).length;

  beforeEach(async () => {
    jest.useFakeTimers();

    cacheStorage = {
      mget: jest.fn(async (keys: string[]) =>
        keys.map((key) => redisEntries.get(key)),
      ),
      mset: jest.fn(),
      mdel: jest.fn(),
      del: jest.fn(),
      setIfAbsent: jest.fn(),
    } as unknown as typeof cacheStorage;

    const discoveryService = {
      getProviders: () => [
        { instance: new ApiKeyRoleMapTestProvider() },
        { instance: new FeatureFlagsMapTestProvider() },
      ],
    } as unknown as DiscoveryService;
    const cacheMetricsService = {
      start: jest.fn(),
      stop: jest.fn(),
      recordRecompute: jest.fn(),
      recordRedisWrite: jest.fn(),
      recordEviction: jest.fn(),
      recordPackingRun: jest.fn(),
      recordUnpacking: jest.fn(),
    } as unknown as WorkspaceCacheMetricsService;
    const twentyConfigService = {
      get: jest.fn().mockReturnValue(3600),
    } as unknown as TwentyConfigService;

    service = new WorkspaceCacheService(
      cacheStorage as unknown as CacheStorageService,
      {} as DataSource,
      discoveryService,
      new Reflector(),
      cacheMetricsService,
      twentyConfigService,
    );

    await service.onModuleInit();
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.useRealTimers();
  });

  describe('evictWorkspaceFromLocalCache', () => {
    it('drops the local copy so the next read fetches the data again', async () => {
      await service.getOrRecompute(WORKSPACE_1_ID, ['apiKeyRoleMap']);

      // Past the memoizer and local TTLs, a read only re-checks the hash.
      jest.setSystemTime(Date.now() + 11_000);

      await service.getOrRecompute(WORKSPACE_1_ID, ['apiKeyRoleMap']);

      expect(countDataFetches(WORKSPACE_1_ID)).toBe(1);

      await service.evictWorkspaceFromLocalCache(WORKSPACE_1_ID);

      const { apiKeyRoleMap } = await service.getOrRecompute(WORKSPACE_1_ID, [
        'apiKeyRoleMap',
      ]);

      expect(apiKeyRoleMap).toEqual({ 'api-key-1': 'role-1' });
      expect(countDataFetches(WORKSPACE_1_ID)).toBe(2);
    });

    it('leaves Redis and the other workspaces untouched', async () => {
      await service.getOrRecompute(WORKSPACE_1_ID, ['apiKeyRoleMap']);
      await service.getOrRecompute(WORKSPACE_2_ID, ['apiKeyRoleMap']);

      await service.evictWorkspaceFromLocalCache(WORKSPACE_1_ID);

      jest.setSystemTime(Date.now() + 11_000);

      await service.getOrRecompute(WORKSPACE_2_ID, ['apiKeyRoleMap']);

      expect(countDataFetches(WORKSPACE_2_ID)).toBe(1);
      expect(cacheStorage.mdel).not.toHaveBeenCalled();
    });
  });

  describe('redis keys', () => {
    const UNCACHED_WORKSPACE_ID = '7c1a2b3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';

    it('writes every key of a multi-provider batch under the workspace hash tag', async () => {
      await service.getOrRecompute(UNCACHED_WORKSPACE_ID, [
        'apiKeyRoleMap',
        'featureFlagsMap',
      ]);

      const writtenKeys = cacheStorage.mset.mock.calls.flatMap(([entries]) =>
        entries.map(({ key }) => key),
      );

      expect(writtenKeys).toEqual(
        expect.arrayContaining([
          `apiKeyRoleMap:{${UNCACHED_WORKSPACE_ID}}:hash`,
          `featureFlagsMap:{${UNCACHED_WORKSPACE_ID}}:hash`,
        ]),
      );
      expect(
        writtenKeys.every((key) => key.includes(`{${UNCACHED_WORKSPACE_ID}}`)),
      ).toBe(true);
    });

    it('deletes tagged keys in one batch and untagged legacy keys one by one on flush', async () => {
      await service.flush(WORKSPACE_1_ID, ['apiKeyRoleMap', 'featureFlagsMap']);

      const deletedInBatch = cacheStorage.mdel.mock.calls.flatMap(
        ([keys]) => keys,
      );

      expect(
        deletedInBatch.every((key) => key.includes(`{${WORKSPACE_1_ID}}`)),
      ).toBe(true);

      const deletedOneByOne = cacheStorage.del.mock.calls.map(([key]) => key);

      expect(deletedOneByOne.sort()).toEqual(
        [
          `apiKeyRoleMap:${WORKSPACE_1_ID}:data`,
          `apiKeyRoleMap:${WORKSPACE_1_ID}:hash`,
          `featureFlagsMap:${WORKSPACE_1_ID}:data`,
          `featureFlagsMap:${WORKSPACE_1_ID}:hash`,
        ].sort(),
      );
    });
  });
});
