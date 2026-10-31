/* @license Enterprise */

import { type RowAccessPolicySubject } from 'src/engine/permissions/combine/types/row-access-policy.type';

export type EventRecordAccessGate = {
  resolveAdmittedRecordIds: (
    subject: RowAccessPolicySubject,
  ) => Promise<Set<string>>;
};
