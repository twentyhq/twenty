import { PermissionFlagType } from 'twenty-shared/constants';

import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const DATA_MODEL_MANAGER_ROLE: StandardRoleDefinition = {
  standardId: '20202020-0001-0001-0001-000000000006',
  label: 'Data Model Manager',
  description: 'Role for managing the workspace data model',
  icon: 'IconDatabaseEdit',
  isEditable: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: false,
  canBeAssignedToApplications: true,
  permissionFlags: [PermissionFlagType.DATA_MODEL],
  applicationId: null,
};
