import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import {
  WORKSPACE_CACHE_KEY,
  WORKSPACE_CACHE_OPTIONS,
} from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const FIELD_MAPS_KEY = 'flatFieldMetadataMaps';
const OBJECT_MAPS_KEY = 'flatObjectMetadataMaps';

type FieldSnapshot = { fieldNames: string[] };

class FakeCacheStorage {
  private readonly store = new Map<string, unknown>();

  async mget<T>(keys: string[]): Promise<(T | undefined)[]> {
    return keys.map((key) => this.store.get(key) as T | undefined);
  }

  async mset(entries: Array<{ key: string; value: unknown }>): Promise<void> {
    for (const { key, value } of entries) {
      this.store.set(key, value);
    }
  }

  async mdel(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.store.delete(key);
    }
  }

  async setIfAbsent(key: string, value: unknown): Promise<void> {
    if (!this.store.has(key)) {
      this.store.set(key, value);
    }
  }
}

class GatedProvider extends WorkspaceCacheProvider {
  public snapshotToServe: unknown = {};
  private pendingGate?: {
    blocked: Promise<void>;
    release: () => void;
    signalEntered: () => void;
  };

  gateNextCompute(): { entered: Promise<void>; release: () => void } {
    let release!: () => void;
    let signalEntered!: () => void;

    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    const entered = new Promise<void>((resolve) => {
      signalEntered = resolve;
    });

    this.pendingGate = { blocked, release, signalEntered };

    return { entered, release };
  }

  async computeForCache(): Promise<never> {
    const snapshot = structuredClone(this.snapshotToServe);
    const gate = this.pendingGate;

    if (gate) {
      this.pendingGate = undefined;
      gate.signalEntered();
      await gate.blocked;
    }

    return snapshot as never;
  }
}

const buildService = (
  providersByKeyName: Map<WorkspaceCacheKeyName, GatedProvider>,
) => {
  const cacheStorage = new FakeCacheStorage();

  const keyNameByProvider = new Map<unknown, WorkspaceCacheKeyName>();

  for (const [keyName, provider] of providersByKeyName) {
    keyNameByProvider.set(provider.constructor, keyName);
  }

  const discoveryService = {
    getProviders: () =>
      [...providersByKeyName.values()].map((instance) => ({ instance })),
  };

  // Every provider here shares the same class, so resolve the key name per instance.
  const keyNamesToAssign = [...providersByKeyName.keys()];
  let assignedKeyNameIndex = 0;

  const reflector = {
    get: (metadataKey: string) => {
      if (metadataKey === WORKSPACE_CACHE_KEY) {
        return keyNamesToAssign[assignedKeyNameIndex++];
      }

      if (metadataKey === WORKSPACE_CACHE_OPTIONS) {
        return { packingPonderation: 64 };
      }

      return undefined;
    },
  };

  const cacheMetricsService = {
    start: jest.fn(),
    stop: jest.fn(),
    recordRecompute: jest.fn(),
    recordRedisWrite: jest.fn(),
    recordEviction: jest.fn(),
    recordUnpacking: jest.fn(),
    recordPackingRun: jest.fn(),
  };

  const twentyConfigService = { get: () => 3600 };

  return new WorkspaceCacheService(
    cacheStorage as never,
    discoveryService as never,
    reflector as never,
    cacheMetricsService as never,
    twentyConfigService as never,
  );
};

describe('WorkspaceCacheService', () => {
  let fieldMapsProvider: GatedProvider;
  let objectMapsProvider: GatedProvider;
  let service: WorkspaceCacheService;

  const readCommittedFieldNames = async (): Promise<string[]> => {
    const data = await service.getOrRecompute(WORKSPACE_ID, [FIELD_MAPS_KEY]);

    return (data[FIELD_MAPS_KEY] as unknown as FieldSnapshot).fieldNames;
  };

  const commitMigration = (fieldNames: string[]) => {
    fieldMapsProvider.snapshotToServe = { fieldNames } satisfies FieldSnapshot;
  };

  beforeEach(async () => {
    fieldMapsProvider = new GatedProvider();
    objectMapsProvider = new GatedProvider();
    service = buildService(
      new Map([
        [FIELD_MAPS_KEY as WorkspaceCacheKeyName, fieldMapsProvider],
        [OBJECT_MAPS_KEY as WorkspaceCacheKeyName, objectMapsProvider],
      ]),
    );
    await service.onModuleInit();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('should keep serving a recomputed entry when no invalidation raced it', async () => {
    commitMigration(['fieldFromMigrationA']);

    const computeSpy = jest.spyOn(fieldMapsProvider, 'computeForCache');

    expect(await readCommittedFieldNames()).toEqual(['fieldFromMigrationA']);
    expect(await readCommittedFieldNames()).toEqual(['fieldFromMigrationA']);

    expect(computeSpy).toHaveBeenCalledTimes(1);
  });

  it('should not serve a snapshot that was computed before the latest invalidation', async () => {
    commitMigration(['fieldFromMigrationA']);

    expect(await readCommittedFieldNames()).toEqual(['fieldFromMigrationA']);

    // A detached reader (the metadata event publisher) starts while a migration is
    // invalidating: the entry is gone from storage, so the reader recomputes from the database.
    await service.flush(WORKSPACE_ID, [FIELD_MAPS_KEY, OBJECT_MAPS_KEY]);

    const detachedCompute = fieldMapsProvider.gateNextCompute();
    const detachedRead = service.getOrRecompute(WORKSPACE_ID, [
      FIELD_MAPS_KEY,
      OBJECT_MAPS_KEY,
    ]);

    await detachedCompute.entered;

    // The next migration commits and refreshes the cache while that read is still in flight.
    commitMigration(['fieldFromMigrationA', 'fieldFromMigrationB']);
    await service.invalidateAndRecompute(WORKSPACE_ID, [FIELD_MAPS_KEY]);

    detachedCompute.release();
    await detachedRead;

    expect(await readCommittedFieldNames()).toEqual([
      'fieldFromMigrationA',
      'fieldFromMigrationB',
    ]);
  });

  it('should not memoize a snapshot that an invalidation overtook', async () => {
    commitMigration(['fieldFromMigrationA']);

    await readCommittedFieldNames();
    await service.flush(WORKSPACE_ID, [FIELD_MAPS_KEY, OBJECT_MAPS_KEY]);

    const detachedCompute = fieldMapsProvider.gateNextCompute();
    const detachedRead = service.getOrRecompute(WORKSPACE_ID, [
      FIELD_MAPS_KEY,
      OBJECT_MAPS_KEY,
    ]);

    await detachedCompute.entered;

    commitMigration(['fieldFromMigrationA', 'fieldFromMigrationB']);
    await service.invalidateAndRecompute(WORKSPACE_ID, [FIELD_MAPS_KEY]);

    detachedCompute.release();
    await detachedRead;

    // Same key combination as the detached read, so it would hit that memoized result.
    const data = await service.getOrRecompute(WORKSPACE_ID, [
      FIELD_MAPS_KEY,
      OBJECT_MAPS_KEY,
    ]);

    expect(
      (data[FIELD_MAPS_KEY] as unknown as FieldSnapshot).fieldNames,
    ).toEqual(['fieldFromMigrationA', 'fieldFromMigrationB']);
  });
});
