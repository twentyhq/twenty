/* @license Enterprise */

import {
  type PermissionsApplicationPrincipalWithRole,
  type PermissionsPrincipalsWithRolesContext,
} from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

// TODO(@charlesBochet): members hold Admin, the Standard app's default role (#28667); simplify once they no longer do
export const getPermissionsPrincipalsActingApplication = ({
  principals,
}: {
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
  >;
}):
  | Extract<PermissionsApplicationPrincipalWithRole, { type: 'application' }>
  | undefined => {
  const { mainPrincipal, limitingPrincipal, applicationPrincipal } = principals;

  if (mainPrincipal.type === 'application') {
    return mainPrincipal;
  }

  if (
    applicationPrincipal.type === 'customApplication' ||
    (isPermissionMainPrincipalWorkspaceMember(mainPrincipal) &&
      applicationPrincipal.roleId === mainPrincipal.roleId) ||
    applicationPrincipal.roleId === limitingPrincipal?.roleId
  ) {
    return undefined;
  }

  return applicationPrincipal;
};
