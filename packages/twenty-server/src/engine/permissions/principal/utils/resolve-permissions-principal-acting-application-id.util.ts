/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type RoleIdsBySource } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { isDenyingRoleIdsBySource } from 'src/engine/permissions/principal/utils/is-denying-role-ids-by-source.util';

// TODO(@charlesBochet): members hold Admin, the Standard app's default role (#28667); simplify once they no longer do
export const resolvePermissionsPrincipalActingApplicationId = ({
  intersectionOf,
  flatApplicationMaps,
}: {
  intersectionOf: RoleIdsBySource;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): string | undefined => {
  const { applicationRoleId, ...nonApplicationRoleIdsBySource } =
    intersectionOf;

  if (
    !isDefined(applicationRoleId) ||
    isDenyingRoleIdsBySource(intersectionOf) ||
    Object.values(nonApplicationRoleIdsBySource).includes(applicationRoleId)
  ) {
    return undefined;
  }

  return Object.values(flatApplicationMaps.byId).find(
    (flatApplication) =>
      flatApplication?.defaultRoleId === applicationRoleId &&
      !isDefined(flatApplication.deletedAt),
  )?.id;
};
