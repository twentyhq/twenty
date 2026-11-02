/* @license Enterprise */

import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

export type EventRecordAccessGate = {
  resolveAdmittedRecordIds: (
    principal: PermissionsPrincipalsContext,
  ) => Promise<Set<string>>;
};
