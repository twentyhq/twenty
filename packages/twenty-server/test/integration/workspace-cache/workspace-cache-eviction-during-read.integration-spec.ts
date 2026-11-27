import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const waitForLocalCacheToGoStale = () =>
  new Promise((resolve) => setTimeout(resolve, 150));

const waitForMicrotasks = async (count: number) => {
  for (let index = 0; index < count; index++) {
    await Promise.resolve();
  }
};

describe('Workspace cache eviction during a read', () => {
  let workspaceCacheService: WorkspaceCacheService;

  beforeAll(() => {
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(Array.from({ length: 12 }, (_, index) => index))(
    'returns every requested key when the local cache is cleared %i microtasks after the hash read',
    async (microtaskCount) => {
      await workspaceCacheService.evictWorkspaceFromLocalCache(
        SEED_APPLE_WORKSPACE_ID,
      );
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'rolesPermissions',
      ]);
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'featureFlagsMap',
      ]);
      await waitForLocalCacheToGoStale();

      const { cacheStorage } = workspaceCacheService as unknown as {
        cacheStorage: CacheStorageService;
      };
      const mget = cacheStorage.mget.bind(cacheStorage);

      const mgetSpy = jest
        .spyOn(cacheStorage, 'mget')
        .mockImplementationOnce(async (keys: string[]) => {
          const values = await mget(keys);

          void waitForMicrotasks(microtaskCount).then(() =>
            (
              workspaceCacheService as unknown as {
                localCache: Map<string, unknown>;
              }
            ).localCache.clear(),
          );

          return values as never;
        });

      const { rolesPermissions, featureFlagsMap } =
        await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
          'featureFlagsMap',
          'rolesPermissions',
        ]);

      expect(mgetSpy).toHaveBeenCalled();
      expect(rolesPermissions).toBeDefined();
      expect(featureFlagsMap).toBeDefined();
    },
  );
});
