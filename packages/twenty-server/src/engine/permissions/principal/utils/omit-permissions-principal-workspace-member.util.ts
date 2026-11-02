/* @license Enterprise */

import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

export const omitPermissionsPrincipalWorkspaceMember = (
  principal: PermissionsPrincipalsContext,
): PermissionsPrincipalsContext => {
  if (!('workspaceMemberId' in principal.mainPrincipal)) {
    return principal;
  }

  return {
    ...principal,
    mainPrincipal: {
      roleId: principal.mainPrincipal.roleId,
      isDeprecatedRoleOnly: true,
    },
  };
};
