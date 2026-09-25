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
  data: Record<string, string> = {};

  computeForCache(): Record<string, string> {
    return this.data;
  }
}

const WORKSPACE_1_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const WORKSPACE_2_ID = '3b8e6458-5fc1-4e63-8563-008ccddaa6db';

const buildCacheKey = (workspaceId: string, suffix: 'hash' | 'data') =>
  `apiKeyRoleMap:${workspaceId}:${suffix}`;

describe('WorkspaceCacheService', () => {
  const redisEntries = new Map<string, unknown>();

  let cacheStorage: jest.Mocked<
    Pick<CacheStorageService, 'mget' | 'mset' | 'mdel' | 'setIfAbsent'>
  >;
  let service: WorkspaceCacheService;
  let otherService: WorkspaceCacheService;
  let provider: ApiKeyRoleMapTestProvider;

  const countDataFetches = (workspaceId: string) =>
    cacheStorage.mget.mock.calls.filter(([keys]) =>
      keys.includes(buildCacheKey(workspaceId, 'data')),
    ).length;

  beforeEach(async () => {
    jest.useFakeTimers();
    redisEntries.clear();
    for (const [workspaceId, roleMap] of [
      [WORKSPACE_1_ID, { 'api-key-1': 'role-1' }],
      [WORKSPACE_2_ID, { 'api-key-2': 'role-2' }],
    ] as const) {
      redisEntries.set(buildCacheKey(workspaceId, 'hash'), workspaceId);
      redisEntries.set(buildCacheKey(workspaceId, 'data'), roleMap);
    }

    cacheStorage = {
      mget: jest.fn(async (keys: string[]) =>
        keys.map((key) => redisEntries.get(key)),
      ),
      mset: jest.fn(async (entries: Array<{ key: string; value: unknown }>) => {
        for (const { key, value } of entries) redisEntries.set(key, value);
      }),
      mdel: jest.fn(async (keys: string[]) => {
        for (const key of keys) redisEntries.delete(key);
      }),
      setIfAbsent: jest.fn(),
    } as unknown as typeof cacheStorage;

    provider = new ApiKeyRoleMapTestProvider();
    const discoveryService = {
      getProviders: () => [{ instance: provider }],
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

    const createService = () =>
      new WorkspaceCacheService(
        cacheStorage as unknown as CacheStorageService,
        {} as DataSource,
        discoveryService,
        new Reflector(),
        cacheMetricsService,
        twentyConfigService,
      );

    service = createService();
    otherService = createService();
    await service.onModuleInit();
    await otherService.onModuleInit();
  });

  afterEach(() => {
    service.onModuleDestroy();
    otherService.onModuleDestroy();
    jest.useRealTimers();
  });

  it('observes policy invalidated by another server after the local freshness window', async () => {
    await service.getOrRecompute(WORKSPACE_1_ID, ['apiKeyRoleMap']);
    await otherService.getOrRecompute(WORKSPACE_1_ID, ['apiKeyRoleMap']);
    provider.data = { 'api-key-1': 'restricted-role' };

    await otherService.invalidateAndRecompute(WORKSPACE_1_ID, [
      'apiKeyRoleMap',
    ]);
    jest.setSystemTime(Date.now() + 101);

    const { apiKeyRoleMap } = await service.getOrRecompute(WORKSPACE_1_ID, [
      'apiKeyRoleMap',
    ]);

    expect(apiKeyRoleMap).toEqual({ 'api-key-1': 'restricted-role' });
  });

  it('retains the local freshness window and coalesces concurrent hash checks', async () => {
    await service.getOrRecompute(WORKSPACE_1_ID, ['apiKeyRoleMap']);
    cacheStorage.mget.mockClear();
    await Promise.all(
      Array.from({ length: 20 }, () =>
        service.getOrRecompute(WORKSPACE_1_ID, ['apiKeyRoleMap']),
      ),
    );
    expect(cacheStorage.mget).not.toHaveBeenCalled();

    jest.setSystemTime(Date.now() + 101);
    await Promise.all(
      Array.from({ length: 20 }, () =>
        service.getOrRecompute(WORKSPACE_1_ID, ['apiKeyRoleMap']),
      ),
    );
    expect(cacheStorage.mget).toHaveBeenCalledTimes(1);
    expect(cacheStorage.mget).toHaveBeenCalledWith([
      buildCacheKey(WORKSPACE_1_ID, 'hash'),
    ]);
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
});
