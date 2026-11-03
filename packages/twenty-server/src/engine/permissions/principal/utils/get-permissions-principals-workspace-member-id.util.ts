/* @license Enterprise */

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const getPermissionsPrincipalsWorkspaceMemberId = (
  principals: Pick<PermissionsPrincipalsWithRolesContext, 'mainPrincipal'>,
): string | undefined =>
  principals.mainPrincipal.type === 'workspaceMember'
    ? principals.mainPrincipal.workspaceMemberId
    : undefined;
