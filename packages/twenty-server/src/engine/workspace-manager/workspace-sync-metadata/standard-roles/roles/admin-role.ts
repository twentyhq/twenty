import { msg } from '@lingui/core/macro';

import { StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const adminRole: StandardRoleDefinition = {
  standardId: '20202020-0001-0001-0001-000000000001',
  label: msg`Admin`.message as string,
  description: msg`Admin role`.message as string,
  icon: 'IconUserCog',
  isEditable: false,
  canUpdateAllSettings: true,
  canAccessAllTools: true,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: true,
};
