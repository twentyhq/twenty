import { DiscoveryService, Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { WORKSPACE_CACHE_KEY } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

// Simulates the database: the migration runner writes to it, then triggers a
// cache recomputation that reads from it.
let dbFieldMaps = 'OLD_MAPS_WITHOUT_NEW_FIELD';
let dbObjectMaps = 'OLD_OBJECT_MAPS';

class MockFlatFieldMetadataMapsProvider extends WorkspaceCacheProvider<string> {
  async computeForCache(_workspaceId: string) {
    return dbFieldMaps;
  }
}

class MockFlatObjectMetadataMapsProvider extends WorkspaceCacheProvider<string> {
  async computeForCache(_workspaceId: string) {
    return dbObjectMaps;
  }
}

describe('WorkspaceCacheService invalidation race', () => {
  // Functional fake Redis. mget snapshots values at call time (like a real
  // Redis server executing the command) but delivery to the caller can be
  // delayed via a gate, simulating an event-loop or network delay.
  let redis: Map<string, unknown>;
  let gateNextDataMget: boolean;
  let pendingGate: Promise<void>;
  let releaseGate: () => void;

  const createService = async (): Promise<WorkspaceCacheService> => {
    const cacheStorageMock = {
      mget: jest.fn(async (keys: string[]) => {
        const snapshot = keys.map((key) => redis.get(key));

        if (gateNextDataMget && keys.some((key) => key.endsWith(':data'))) {
          gateNextDataMget = false;
          await pendingGate;
        }

        return snapshot;
      }),
      mset: jest.fn(async (entries: Array<{ key: string; value: unknown }>) => {
        entries.forEach(({ key, value }) => redis.set(key, value));
      }),
      mdel: jest.fn(async (keys: string[]) => {
        keys.forEach((key) => redis.delete(key));
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceCacheService,
        {
          provide: CacheStorageNamespace.EngineWorkspace,
          useValue: cacheStorageMock,
        },
        {
          provide: DiscoveryService,
          useValue: {
            getProviders: jest
              .fn()
              .mockReturnValue([
                { instance: new MockFlatFieldMetadataMapsProvider() },
                { instance: new MockFlatObjectMetadataMapsProvider() },
              ]),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn((metadataKey: string, target: unknown) => {
              if (metadataKey !== WORKSPACE_CACHE_KEY) {
                return undefined;
              }

              return target === MockFlatFieldMetadataMapsProvider
                ? 'flatFieldMetadataMaps'
                : 'flatObjectMetadataMaps';
            }),
          },
        },
        {
          provide: MetricsService,
          useValue: { incrementCounterBy: jest.fn() },
        },
      ],
    }).compile();

    const service = module.get<WorkspaceCacheService>(WorkspaceCacheService);

    await service.onModuleInit();

    return service;
  };

  beforeEach(() => {
    jest.useRealTimers();
    redis = new Map();
    gateNextDataMget = false;
    dbFieldMaps = 'OLD_MAPS_WITHOUT_NEW_FIELD';
    dbObjectMaps = 'OLD_OBJECT_MAPS';
  });

  it('should not serve pre-invalidation data written back by a slow concurrent reader', async () => {
    // Populate Redis with the pre-migration state through a first service
    // instance, then use a second instance with an empty local cache: this
    // simulates a reader whose local entry is absent or stale.
    const seedingService = await createService();

    await seedingService.invalidateAndRecompute(WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);

    const service = await createService();

    // T0: a background reader (e.g. a metadata event listener) starts reading
    // the flat maps. Its Redis data fetch is snapshotted now (pre-migration
    // state) but delivered late.
    pendingGate = new Promise<void>((resolve) => {
      releaseGate = resolve;
    });
    gateNextDataMget = true;

    const backgroundReader = service.getOrRecompute(WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);

    // Let the reader reach the gated mget.
    await new Promise((resolve) => setImmediate(resolve));

    // T1: a migration commits a new field and invalidates the cache.
    dbFieldMaps = 'NEW_MAPS_WITH_NEW_FIELD';
    await service.invalidateAndRecompute(WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatObjectMetadataMaps',
    ]);

    // T2: the reader's pre-invalidation Redis snapshot arrives late.
    releaseGate();
    await backgroundReader;

    // T3: the migration's post-commit lookup must see the new state.
    const { flatFieldMetadataMaps } = await service.getOrRecompute(
      WORKSPACE_ID,
      ['flatFieldMetadataMaps'],
    );

    expect(flatFieldMetadataMaps).toBe('NEW_MAPS_WITH_NEW_FIELD');
  });
});
