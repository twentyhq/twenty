import { isFindAllViewsCacheInvalidationRequired } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/is-find-all-views-cache-invalidation-required.util';

describe('isFindAllViewsCacheInvalidationRequired', () => {
  it.each([
    'flatObjectMetadataMaps',
    'flatFieldMetadataMaps',
    'flatViewMaps',
    'flatViewFieldMaps',
    'flatViewFieldGroupMaps',
    'flatViewGroupMaps',
    'flatViewSortMaps',
    'flatViewFilterMaps',
    'flatViewFilterGroupMaps',
  ] as const)('returns true for %s', (cacheKey) => {
    expect(isFindAllViewsCacheInvalidationRequired([cacheKey])).toBe(true);
  });

  it('returns false for unrelated cache keys', () => {
    expect(isFindAllViewsCacheInvalidationRequired(['flatRoleMaps'])).toBe(
      false,
    );
  });
});
