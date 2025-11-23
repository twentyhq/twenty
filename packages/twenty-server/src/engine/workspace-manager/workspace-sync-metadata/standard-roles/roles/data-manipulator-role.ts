import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const DATA_MANIPULATOR_ROLE: StandardRoleDefinition = {
  standardId: '20202020-0001-0001-0001-000000000004',
  label: 'Data Manipulator',
  description: 'Read and write access to all object records',
  icon: 'IconEdit',
  isEditable: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: false,
  applicationId: null, // TODO: Replace with Twenty application ID
  createdAt: new Date(),
  updatedAt: new Date(),
  roleTargetIds: [],
  objectPermissionIds: [],
  permissionFlagIds: [],
  fieldPermissionIds: [],
};
