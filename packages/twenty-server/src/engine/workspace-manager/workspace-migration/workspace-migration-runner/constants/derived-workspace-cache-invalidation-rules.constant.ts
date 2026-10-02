import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { ROLE_RECORD_PERMISSION_PROPERTIES } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/role-record-permission-properties.constant';
import { type DerivedWorkspaceCacheInvalidationTrigger } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/derived-workspace-cache-invalidation-trigger.type';

// Each entry lists the metadata changes that can alter what the cache provider reads,
// including rows the database deletes in cascade when a parent row is deleted
export const DERIVED_WORKSPACE_CACHE_INVALIDATION_RULES = {
  rolesPermissions: [
    {
      metadataName: 'role',
      updatedProperties: ROLE_RECORD_PERMISSION_PROPERTIES,
    },
    { metadataName: 'objectPermission' },
    { metadataName: 'fieldPermission' },
    { metadataName: 'rolePermissionFlag' },
    { metadataName: 'permissionFlag', actionTypes: ['delete'] },
    { metadataName: 'rowLevelPermissionPredicate' },
    { metadataName: 'rowLevelPermissionPredicateGroup' },
    {
      metadataName: 'objectMetadata',
      updatedProperties: ['labelIdentifierFieldMetadataUniversalIdentifier'],
    },
    { metadataName: 'fieldMetadata', actionTypes: ['delete'] },
  ],
  roleIdsWithAllRecordsAccess: [
    { metadataName: 'role', updatedProperties: ['canUpdateAllSettings'] },
  ],
  userWorkspaceRoleMap: [
    { metadataName: 'roleTarget' },
    { metadataName: 'role', actionTypes: ['delete'] },
  ],
  apiKeyRoleMap: [
    { metadataName: 'roleTarget' },
    { metadataName: 'role', actionTypes: ['delete'] },
  ],
  flatRoleTargetByAgentIdMaps: [
    { metadataName: 'roleTarget' },
    { metadataName: 'role', actionTypes: ['delete'] },
    { metadataName: 'agent', actionTypes: ['delete'] },
  ],
  // Agents declare no relation to their role targets, so an agent migration does not reload them
  flatRoleTargetMaps: [{ metadataName: 'agent', actionTypes: ['delete'] }],
  applicationVariableMaps: [{ metadataName: 'applicationVariable' }],
} as const satisfies Partial<
  Record<
    WorkspaceCacheKeyName,
    readonly DerivedWorkspaceCacheInvalidationTrigger[]
  >
>;
