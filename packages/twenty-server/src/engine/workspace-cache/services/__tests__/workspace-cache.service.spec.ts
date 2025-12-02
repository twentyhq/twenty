import { DiscoveryService, Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WORKSPACE_CACHE_KEY } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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

describe('WorkspaceCacheService', () => {
  let service: WorkspaceCacheService;
  let cacheStorageService: jest.Mocked<CacheStorageService>;
  let discoveryService: jest.Mocked<DiscoveryService>;
  let reflector: jest.Mocked<Reflector>;
  let mockProvider: MockFeatureFlagsCacheProvider;

  beforeEach(async () => {
    jest.useFakeTimers();

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
    });

    it('should return data from redis when available', async () => {
      const cachedData = { FLAG_A: true, FLAG_B: false };

      cacheStorageService.mget
        .mockResolvedValueOnce([undefined])
        .mockResolvedValueOnce([cachedData]);

      const result = await service.getOrRecompute(WORKSPACE_ID, [
        'featureFlagsMap',
      ]);

      expect(result).toEqual({ featureFlagsMap: cachedData });
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

      // Each getOrRecompute call triggers 2 mget calls (hash check + data fetch)
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

    it('should delete from redis and local cache, then recompute', async () => {
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
  });

  describe('flush', () => {
    it('should delete from redis and local cache', async () => {
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
  });
});
