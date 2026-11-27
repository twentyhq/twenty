import { type WorkspaceDerivedCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const VIEW_CONTENT_HASH_BY_VIEW_ID_CACHE_KEY_NAMES = [
  'viewHashByViewId',
  'viewFieldsHashByViewId',
  'viewFieldGroupsHashByViewId',
  'viewFiltersHashByViewId',
  'viewFilterGroupsHashByViewId',
  'viewGroupsHashByViewId',
  'viewSortsHashByViewId',
] as const satisfies WorkspaceDerivedCacheKeyName[];
