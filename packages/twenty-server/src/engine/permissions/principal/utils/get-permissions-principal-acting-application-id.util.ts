/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';

// TODO(@charlesBochet): members hold Admin, the Standard app's default role (#28667); simplify once they no longer do
export const getPermissionsPrincipalActingApplicationId = ({
  principal,
  flatApplicationMaps,
}: {
  principal: Omit<PermissionsPrincipal, 'workspaceId'>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): string | undefined => {
  const { appRoleId } = principal;

  if (
    !isDefined(appRoleId) ||
    appRoleId === principal.main?.roleId ||
    appRoleId === principal.limitingRoleId ||
    getPermissionsPrincipalRoleIds(principal).length === 0
  ) {
    return undefined;
  }

  return Object.values(flatApplicationMaps.byId).find(
    (flatApplication) =>
      flatApplication?.defaultRoleId === appRoleId &&
      !isDefined(flatApplication.deletedAt),
  )?.id;
};
