import { DiscoveryService, Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCacheMetricsService } from 'src/engine/workspace-cache/services/workspace-cache-metrics.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ROLES_PERMISSIONS: Record<string, RoleRecordsPermissions> = {};
const REDIS_HASH = 'hash-1';

@WorkspaceCache('rolesPermissions', { packingPonderation: 1 })
class RolesPermissionsTestProvider extends WorkspaceCacheProvider<
  Record<string, RoleRecordsPermissions>
> {
  computeForCache() {
    return ROLES_PERMISSIONS;
  }
}

describe('WorkspaceCacheService', () => {
  let module: TestingModule;
  let service: WorkspaceCacheService;
  let evictLocalCacheAfterRedisHashes: (() => void) | null;

  beforeEach(async () => {
    evictLocalCacheAfterRedisHashes = null;

    const mget = jest.fn((keys: string[]) => {
      const values = keys.map((key) =>
        key.endsWith(':hash') ? REDIS_HASH : ROLES_PERMISSIONS,
      );
      const result = Promise.resolve(values);
      const evict = evictLocalCacheAfterRedisHashes;

      if (isHashOnlyRequest(keys) && isDefined(evict)) {
        // queueMicrotask is faked by the global fake timers
        void result.then(() => Promise.resolve().then(evict));
      }

      return result;
    });

    module = await Test.createTestingModule({
      providers: [
        WorkspaceCacheService,
        Reflector,
        { provide: CacheStorageNamespace.EngineWorkspace, useValue: { mget } },
        { provide: getDataSourceToken(), useValue: {} },
        {
          provide: DiscoveryService,
          useValue: {
            getProviders: () => [
              { instance: new RolesPermissionsTestProvider() },
            ],
          },
        },
        {
          provide: WorkspaceCacheMetricsService,
          useValue: {
            start: jest.fn(),
            stop: jest.fn(),
            recordUnpacking: jest.fn(),
            recordPackingRun: jest.fn(),
          },
        },
        { provide: TwentyConfigService, useValue: { get: () => 3600 } },
      ],
    }).compile();

    service = module.get(WorkspaceCacheService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    service.onModuleDestroy();
    await module.close();
  });

  it('should return an entry validated against Redis when the local cache is evicted before the result is assembled', async () => {
    await service.getOrRecompute(WORKSPACE_ID, ['rolesPermissions']);

    // Past the memoizer and the local TTL, so the next read validates the local entry against Redis
    jest.advanceTimersByTime(11_000);

    // Lands where an eviction started elsewhere deletes the entry: after the hash check, before the read
    evictLocalCacheAfterRedisHashes = () => service['localCache'].clear();

    const { rolesPermissions } = await service.getOrRecompute(WORKSPACE_ID, [
      'rolesPermissions',
    ]);

    expect(rolesPermissions).toBe(ROLES_PERMISSIONS);
  });
});

const isHashOnlyRequest = (keys: string[]) =>
  keys.every((key) => key.endsWith(':hash'));
