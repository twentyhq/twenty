import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const METADATA_VISIBILITY_CACHE_KEY_NAMES: ReadonlySet<WorkspaceCacheKeyName> =
  new Set<WorkspaceCacheKeyName>([
    'flatViewMaps',
    'flatViewFieldMaps',
    'flatViewFieldGroupMaps',
    'flatViewFilterMaps',
    'flatViewFilterGroupMaps',
    'flatViewSortMaps',
    'flatViewGroupMaps',
  ]);
