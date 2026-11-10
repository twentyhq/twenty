import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const VIEW_FAMILY_CACHE_KEY_NAMES = [
  'flatViewMaps',
  'flatViewFieldMaps',
  'flatViewFieldGroupMaps',
  'flatViewFilterMaps',
  'flatViewFilterGroupMaps',
  'flatViewSortMaps',
  'flatViewGroupMaps',
] as const satisfies readonly WorkspaceCacheKeyName[];
