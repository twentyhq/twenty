/* @license Enterprise */

import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const getPermissionsPrincipalEphemeralRole = (
  principal: Pick<PermissionsPrincipalsWithRolesContext, 'limitingPrincipal'>,
): PermissionScope | undefined =>
  principal.limitingPrincipal?.type === 'ephemeralRole'
    ? principal.limitingPrincipal.permissions
    : undefined;
