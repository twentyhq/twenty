import omit from 'lodash.omit';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type CompactFlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/compact-flat-field-metadata-maps.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const FLAT_FIELD_METADATA_MAPS_DATA_KEY = `flatFieldMetadataMaps:${SEED_APPLE_WORKSPACE_ID}:data`;

describe('Flat field metadata maps cache', () => {
  let workspaceCacheService: WorkspaceCacheService;
  let cacheStorage: CacheStorageService;

  const getFlatFieldMetadataMaps = async () => {
    const { flatFieldMetadataMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
      ]);

    return flatFieldMetadataMaps;
  };

  beforeAll(() => {
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    cacheStorage = global.app.get<CacheStorageService>(
      CacheStorageNamespace.EngineWorkspace,
    );
  });

  afterAll(async () => {
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatFieldMetadataMaps'],
    );
  });

  it('rebuilds an entry cached before isSearchable existed', async () => {
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatFieldMetadataMaps'],
    );

    const flatFieldMetadataMaps = await getFlatFieldMetadataMaps();
    const compactFlatFieldMetadataMaps =
      await cacheStorage.get<CompactFlatFieldMetadataMaps>(
        FLAT_FIELD_METADATA_MAPS_DATA_KEY,
      );

    await cacheStorage.set(FLAT_FIELD_METADATA_MAPS_DATA_KEY, {
      ...compactFlatFieldMetadataMaps,
      byUniversalIdentifier: Object.fromEntries(
        Object.entries(
          compactFlatFieldMetadataMaps?.byUniversalIdentifier ?? {},
        ).map(([universalIdentifier, compactFlatFieldMetadata]) => [
          universalIdentifier,
          omit(compactFlatFieldMetadata, 'isSearchable'),
        ]),
      ),
    });
    await workspaceCacheService.evictWorkspaceFromLocalCache(
      SEED_APPLE_WORKSPACE_ID,
    );

    expect(await getFlatFieldMetadataMaps()).toEqual(flatFieldMetadataMaps);
    expect(await cacheStorage.get(FLAT_FIELD_METADATA_MAPS_DATA_KEY)).toEqual(
      compactFlatFieldMetadataMaps,
    );
  });
});
