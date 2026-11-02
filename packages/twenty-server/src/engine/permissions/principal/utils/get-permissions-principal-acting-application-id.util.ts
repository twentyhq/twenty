/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

// TODO(@charlesBochet): members hold Admin, the Standard app's default role (#28667); simplify once they no longer do
export const getPermissionsPrincipalActingApplicationId = ({
  principal,
  flatApplicationMaps,
}: {
  principal: Pick<
    PermissionsPrincipalsContext,
    'mainPrincipal' | 'limiting' | 'app'
  >;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): string | undefined => {
  const { mainPrincipal, limiting, app } = principal;

  if ('applicationId' in mainPrincipal) {
    return mainPrincipal.applicationId;
  }

  if (
    !('roleId' in app) ||
    app.roleId === mainPrincipal.roleId ||
    app.roleId === limiting?.roleId
  ) {
    return undefined;
  }

  if ('applicationId' in app) {
    return app.applicationId;
  }

  return Object.values(flatApplicationMaps.byId).find(
    (flatApplication) =>
      flatApplication?.defaultRoleId === app.roleId &&
      !isDefined(flatApplication.deletedAt),
  )?.id;
};
