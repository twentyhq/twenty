/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

// TODO(@charlesBochet): members hold Admin, the Standard app's default role (#28667); simplify once they no longer do
export const getPermissionsPrincipalActingApplicationId = ({
  principal,
  flatApplicationMaps,
}: {
  principal: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal'
  >;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): string | undefined => {
  const { mainPrincipal, limitingPrincipal, applicationPrincipal } = principal;

  if (mainPrincipal.type === 'application') {
    return mainPrincipal.applicationId;
  }

  if (
    applicationPrincipal.type === 'customApplication' ||
    (mainPrincipal.type === 'workspaceMember' &&
      applicationPrincipal.roleId === mainPrincipal.roleId) ||
    applicationPrincipal.roleId === limitingPrincipal?.roleId
  ) {
    return undefined;
  }

  if (applicationPrincipal.type === 'application') {
    return applicationPrincipal.applicationId;
  }

  return Object.values(flatApplicationMaps.byId).find(
    (flatApplication) =>
      flatApplication?.defaultRoleId === applicationPrincipal.roleId &&
      !isDefined(flatApplication.deletedAt),
  )?.id;
};
