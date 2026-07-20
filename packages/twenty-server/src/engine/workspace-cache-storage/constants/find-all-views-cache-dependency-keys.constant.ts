import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const FIND_ALL_VIEWS_CACHE_DEPENDENCY_KEYS = [
  'flatApplicationMaps',
  'flatObjectMetadataMaps',
  'flatFieldMetadataMaps',
  'flatViewMaps',
  'flatViewFieldMaps',
  'flatViewFieldGroupMaps',
  'flatViewGroupMaps',
  'flatViewSortMaps',
  'flatViewFilterMaps',
  'flatViewFilterGroupMaps',
] as const satisfies readonly WorkspaceCacheKeyName[];
