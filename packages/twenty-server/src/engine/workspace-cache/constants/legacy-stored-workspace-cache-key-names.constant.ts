export const LEGACY_STORED_WORKSPACE_CACHE_KEY_NAMES = [
  'graphQLResolverNameMap',
  'userWorkspaceRoleMap',
  'apiKeyRoleMap',
  'roleIdsWithAllRecordsAccess',
  'flatRoleTargetByAgentIdMaps',
  'applicationVariableMaps',
] as const;

export type LegacyStoredWorkspaceCacheKeyName =
  (typeof LEGACY_STORED_WORKSPACE_CACHE_KEY_NAMES)[number];
