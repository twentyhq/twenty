import {
  LEGACY_STORED_WORKSPACE_CACHE_KEY_NAMES,
  type LegacyStoredWorkspaceCacheKeyName,
} from 'src/engine/workspace-cache/constants/legacy-stored-workspace-cache-key-names.constant';

export const isLegacyStoredWorkspaceCacheKeyName = (
  cacheKeyName: string,
): cacheKeyName is LegacyStoredWorkspaceCacheKeyName =>
  LEGACY_STORED_WORKSPACE_CACHE_KEY_NAMES.some(
    (legacyCacheKeyName) => legacyCacheKeyName === cacheKeyName,
  );
