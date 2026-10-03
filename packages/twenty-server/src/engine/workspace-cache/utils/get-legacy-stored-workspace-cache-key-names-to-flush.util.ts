import { type LegacyStoredWorkspaceCacheKeyName } from 'src/engine/workspace-cache/constants/legacy-stored-workspace-cache-key-names.constant';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

const ROLE_SOURCE_CACHE_KEY_NAMES: WorkspaceCacheKeyName[] = [
  'flatRoleMaps',
  'flatRoleTargetMaps',
  'flatObjectPermissionMaps',
  'flatFieldPermissionMaps',
  'flatRolePermissionFlagMaps',
];

export const getLegacyStoredWorkspaceCacheKeyNamesToFlush = (
  invalidatedCacheKeyNames: readonly WorkspaceCacheKeyName[],
): LegacyStoredWorkspaceCacheKeyName[] => {
  const invalidatedCacheKeyNamesSet = new Set(invalidatedCacheKeyNames);
  const legacyCacheKeyNames: LegacyStoredWorkspaceCacheKeyName[] = [];

  if (
    invalidatedCacheKeyNamesSet.has('flatObjectMetadataMaps') ||
    invalidatedCacheKeyNamesSet.has('flatFieldMetadataMaps')
  ) {
    legacyCacheKeyNames.push('graphQLResolverNameMap');
  }

  if (
    ROLE_SOURCE_CACHE_KEY_NAMES.some((cacheKeyName) =>
      invalidatedCacheKeyNamesSet.has(cacheKeyName),
    )
  ) {
    legacyCacheKeyNames.push(
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'roleIdsWithAllRecordsAccess',
      'flatRoleTargetByAgentIdMaps',
    );
  }

  if (invalidatedCacheKeyNamesSet.has('flatApplicationVariableMaps')) {
    legacyCacheKeyNames.push('applicationVariableMaps');
  }

  return legacyCacheKeyNames;
};
