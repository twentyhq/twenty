/* @license Enterprise */

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const getPermissionsPrincipalWorkspaceMemberId = (
  principal: Pick<PermissionsPrincipalsWithRolesContext, 'mainPrincipal'>,
): string | undefined =>
  principal.mainPrincipal.type === 'workspaceMember'
    ? principal.mainPrincipal.workspaceMemberId
    : undefined;
