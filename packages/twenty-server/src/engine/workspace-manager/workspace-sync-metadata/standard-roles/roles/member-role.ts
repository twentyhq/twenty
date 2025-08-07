import { msg } from '@lingui/core/macro';

import { StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const MEMBER_ROLE: StandardRoleDefinition = {
  standardId: '20202020-0001-0001-0001-000000000002',
  label: msg`Member`.message as string,
  description: msg`Member role`.message as string,
  icon: 'IconUser',
  isEditable: true,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: true,
};
