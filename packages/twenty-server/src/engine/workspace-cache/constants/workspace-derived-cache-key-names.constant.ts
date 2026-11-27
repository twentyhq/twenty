import { type WorkspaceDerivedCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export const WORKSPACE_DERIVED_CACHE_KEY_NAMES = {
  roleIdsWithAllRecordsAccess: true,
  userWorkspaceRoleMap: true,
  apiKeyRoleMap: true,
  flatRoleTargetByAgentIdMaps: true,
  flatRoleTargetByApplicationIdMaps: true,
  graphQLResolverNameMap: true,
  objectIdByName: true,
  fieldIdByObjectIdAndName: true,
  coreWorkflowVersionsByCoreWorkflowId: true,
  viewHashByViewId: true,
  viewFieldsHashByViewId: true,
  viewFieldGroupsHashByViewId: true,
  viewFiltersHashByViewId: true,
  viewFilterGroupsHashByViewId: true,
  viewGroupsHashByViewId: true,
  viewSortsHashByViewId: true,
} as const satisfies Record<WorkspaceDerivedCacheKeyName, true>;
