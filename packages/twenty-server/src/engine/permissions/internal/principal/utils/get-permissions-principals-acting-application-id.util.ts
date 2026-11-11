/* @license Enterprise */

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

// TODO(@charlesBochet): members hold Admin, the Standard app's default role (#28667); simplify once they no longer do
export const getPermissionsPrincipalsActingApplicationId = ({
  principals,
}: {
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
  >;
}): string | undefined => {
  const { mainPrincipal, limitingPrincipal, applicationPrincipal } = principals;

  if (mainPrincipal.type === 'application') {
    return mainPrincipal.applicationId;
  }

  if (applicationPrincipal.type === 'customApplication') {
    return undefined;
  }

  // Compared on the requested role, since the grant copying it has its own id
  // TODO: drop both comparisons with the grant fallback, an application then never shares a role
  const applicationRoleId =
    applicationPrincipal.requestedRoleId ?? applicationPrincipal.roleId;

  if (
    (isPermissionMainPrincipalWorkspaceMember(mainPrincipal) &&
      applicationRoleId === mainPrincipal.roleId) ||
    applicationRoleId === limitingPrincipal?.roleId
  ) {
    return undefined;
  }

  return applicationPrincipal.applicationId;
};
