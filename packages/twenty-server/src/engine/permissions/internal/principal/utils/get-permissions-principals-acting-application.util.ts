/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

// TODO(@charlesBochet): members hold Admin, the Standard app's default role (#28667); simplify once they no longer do
export const getPermissionsPrincipalsActingApplication = ({
  principals,
}: {
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
  >;
}): { applicationId: string; roleIds: string[] } | undefined => {
  const { mainPrincipal, limitingPrincipal, applicationPrincipal } = principals;

  if (mainPrincipal.type === 'application') {
    return {
      applicationId: mainPrincipal.applicationId,
      roleIds: mainPrincipal.roleIds,
    };
  }

  if (
    applicationPrincipal.type === 'customApplication' ||
    !isDefined(applicationPrincipal.roleId) ||
    (isPermissionMainPrincipalWorkspaceMember(mainPrincipal) &&
      mainPrincipal.roleIds.includes(applicationPrincipal.roleId)) ||
    applicationPrincipal.roleId === limitingPrincipal?.roleId
  ) {
    return undefined;
  }

  return {
    applicationId: applicationPrincipal.applicationId,
    roleIds: [applicationPrincipal.roleId],
  };
};
