/* @license Enterprise */

import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

export type EventRecordAccessGate = {
  resolveAdmittedRecordIds: (
    principals: PermissionsPrincipalsContext,
  ) => Promise<Set<string>>;
};
