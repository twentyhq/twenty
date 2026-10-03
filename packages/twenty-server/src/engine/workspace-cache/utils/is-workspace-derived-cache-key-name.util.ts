import { WORKSPACE_DERIVED_CACHE_KEY_NAMES } from 'src/engine/workspace-cache/constants/workspace-derived-cache-key-names.constant';
import {
  type WorkspaceCacheReadableKeyName,
  type WorkspaceDerivedCacheKeyName,
} from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const isWorkspaceDerivedCacheKeyName = (
  cacheKeyName: WorkspaceCacheReadableKeyName,
): cacheKeyName is WorkspaceDerivedCacheKeyName =>
  Object.prototype.hasOwnProperty.call(
    WORKSPACE_DERIVED_CACHE_KEY_NAMES,
    cacheKeyName,
  );
