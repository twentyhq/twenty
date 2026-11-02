/* @license Enterprise */

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';

export type EventRecordAccessGate = {
  resolveAdmittedRecordIds: (
    principal: PermissionsPrincipal,
  ) => Promise<Set<string>>;
};
