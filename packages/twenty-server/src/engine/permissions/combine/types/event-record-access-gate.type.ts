/* @license Enterprise */

import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';

export type EventRecordAccessGate = {
  resolveAdmittedRecordIds: (
    authContext: PermissionsAuthContext,
  ) => Promise<Set<string>>;
};
