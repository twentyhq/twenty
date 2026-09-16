import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/utils/build-row-access-policy.util';

export type EventRecordAccessGate = {
  resolveAdmittedRecordIds: (
    subject: RowAccessPolicySubject,
  ) => Promise<Set<string>>;
};
