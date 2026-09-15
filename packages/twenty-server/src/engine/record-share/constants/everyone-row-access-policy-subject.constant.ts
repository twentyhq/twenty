import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';

import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/utils/build-row-access-policy.util';

export const EVERYONE_ROW_ACCESS_POLICY_SUBJECT: RowAccessPolicySubject = {
  objectsPermissions: undefined,
  principalIds: [EVERYONE_PRINCIPAL_ID],
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};
