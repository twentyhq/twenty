import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { assertWorkspaceCacheSourcesAreLoaded } from 'src/engine/workspace-cache/utils/assert-workspace-cache-sources-are-loaded.util';

describe('assertWorkspaceCacheSourcesAreLoaded', () => {
  it('passes when every source entry is loaded', () => {
    const data: Partial<WorkspaceCacheDataMap> = {
      flatRoleMaps: createEmptyFlatEntityMaps(),
      flatRoleTargetMaps: createEmptyFlatEntityMaps(),
    };

    expect(() =>
      assertWorkspaceCacheSourcesAreLoaded(data, [
        'flatRoleMaps',
        'flatRoleTargetMaps',
      ]),
    ).not.toThrow();
  });

  it('throws listing the missing source entries', () => {
    const data: Partial<WorkspaceCacheDataMap> = {
      flatRoleMaps: createEmptyFlatEntityMaps(),
    };

    expect(() =>
      assertWorkspaceCacheSourcesAreLoaded(data, [
        'flatRoleMaps',
        'flatRoleTargetMaps',
        'flatObjectMetadataMaps',
      ]),
    ).toThrow(
      new WorkspaceCacheException(
        'Missing source cache entries: flatRoleTargetMaps, flatObjectMetadataMaps',
        'INTERNAL_SERVER_ERROR',
      ),
    );
  });
});
