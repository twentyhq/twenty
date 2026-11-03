/* @license Enterprise */

import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';

export const canAuthContextHoldRoles = (
  authContext: Pick<PermissionsAuthContext, 'type'>,
): boolean =>
  authContext.type !== 'system' && authContext.type !== 'pendingActivationUser';
