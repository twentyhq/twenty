import { msg } from '@lingui/core/macro';

import { StandardRoleDefinition } from '../types/standard-role-definition.interface';

export const guestRole: StandardRoleDefinition = {
  standardId: '20202020-0001-0001-0001-000000000003',
  label: msg`Guest`.message as string,
  description: msg`Guest role`.message as string,
  icon: 'IconUser',
  isEditable: false,
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
};
