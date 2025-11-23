import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const WORKFLOW_MANAGER_ROLE: StandardRoleDefinition = {
  standardId: '20202020-0001-0001-0001-000000000002',
  label: 'Workflow Manager',
  description: 'Role for managing workflows',
  icon: 'IconSettingsAutomation',
  isEditable: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: false,
  permissionFlags: [PermissionFlagType.WORKFLOWS],
  applicationId: null, // TODO: Replace with Twenty application ID
  createdAt: new Date(),
  updatedAt: new Date(),
  roleTargetIds: [],
  objectPermissionIds: [],
  permissionFlagIds: [],
  fieldPermissionIds: [],
};
