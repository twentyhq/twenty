import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const DASHBOARD_MANAGER_ROLE: StandardRoleDefinition = {
  standardId: '20202020-0001-0001-0001-000000000005',
  label: 'Dashboard Manager',
  description: 'Role for creating and managing dashboards',
  icon: 'IconLayoutDashboard',
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
  permissionFlags: [PermissionFlagType.LAYOUTS],
  applicationId: null, // TODO: Replace with Twenty application ID
};

