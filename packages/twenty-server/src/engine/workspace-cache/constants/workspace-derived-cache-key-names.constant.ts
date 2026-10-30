import { type WorkspaceDerivedCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const WORKSPACE_DERIVED_CACHE_KEY_NAMES = {
  roleIdsWithAllRecordsAccess: true,
  userWorkspaceRoleMap: true,
  apiKeyRoleMap: true,
  flatRoleTargetByAgentIdMaps: true,
  graphQLResolverNameMap: true,
} as const satisfies Record<WorkspaceDerivedCacheKeyName, true>;
