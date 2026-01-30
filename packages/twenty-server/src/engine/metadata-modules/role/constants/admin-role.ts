import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const ADMIN_ROLE = {
  standardId: '20202020-0001-0001-0001-000000000001',
  label: 'Admin',
  description: 'Admin role',
  icon: 'IconUserCog',
  isEditable: false,
  canUpdateAllSettings: true,
  canAccessAllTools: true,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: true,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: true,
} as const satisfies Pick<
  FlatRole,
  | 'standardId'
  | 'label'
  | 'description'
  | 'icon'
  | 'isEditable'
  | 'canUpdateAllSettings'
  | 'canAccessAllTools'
  | 'canReadAllObjectRecords'
  | 'canUpdateAllObjectRecords'
  | 'canSoftDeleteAllObjectRecords'
  | 'canDestroyAllObjectRecords'
  | 'canBeAssignedToUsers'
  | 'canBeAssignedToAgents'
  | 'canBeAssignedToApiKeys'
>;
