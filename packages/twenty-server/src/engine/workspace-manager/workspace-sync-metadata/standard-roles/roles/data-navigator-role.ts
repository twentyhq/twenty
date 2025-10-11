import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const DATA_NAVIGATOR_ROLE: StandardRoleDefinition = {
  standardId: '20202020-0001-0001-0001-000000000003',
  label: 'Data Navigator',
  description: 'Read-only access to all object records',
  icon: 'IconSearch',
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
};
