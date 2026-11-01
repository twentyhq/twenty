/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';

import { type RowAccessPolicySubject } from 'src/engine/permissions/combine/types/row-access-policy.type';

export const EVERYONE_ROW_ACCESS_POLICY_SUBJECT: RowAccessPolicySubject = {
  isSystemContext: false,
  objectsPermissions: undefined,
  principalIds: [EVERYONE_PRINCIPAL_ID],
  workspaceMemberId: undefined,
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};
