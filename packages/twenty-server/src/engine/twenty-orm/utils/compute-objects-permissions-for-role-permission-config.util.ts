import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/twenty-orm/types/application-default-role-maps.type';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/twenty-orm/utils/restrict-objects-permissions-to-disabled-actions.util';

const buildApplicationIdByDefaultRoleId = (
  flatApplicationMaps: ApplicationDefaultRoleMaps,
): Partial<Record<string, string>> =>
  Object.fromEntries(
    Object.values(flatApplicationMaps.byId).flatMap((flatApplication) =>
      isDefined(flatApplication?.defaultRoleId) &&
      !isDefined(flatApplication.deletedAt)
        ? [[flatApplication.defaultRoleId, flatApplication.id]]
        : [],
    ),
  );

export const computeObjectsPermissionsForRolePermissionConfig = ({
  intersectionOf,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatApplicationMaps,
}: {
  intersectionOf: RoleIdsBySource;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): ObjectsPermissions => {
  const roleIds = getRoleIdsToIntersect(intersectionOf);

  if (!isDefined(roleIds)) {
    return {};
  }

  const applicationIdByDefaultRoleId =
    buildApplicationIdByDefaultRoleId(flatApplicationMaps);

  const { applicationRoleId, ...nonApplicationRoleIdsBySource } =
    intersectionOf;
  const nonApplicationRoleIds = new Set(
    Object.values(nonApplicationRoleIdsBySource).filter(isDefined),
  );

  // TODO(@charlesBochet): members hold Admin, the Standard app's default role (#28667); simplify once they no longer do
  const getActingApplicationId = (roleId: string) =>
    roleId === applicationRoleId && !nonApplicationRoleIds.has(roleId)
      ? applicationIdByDefaultRoleId[roleId]
      : undefined;

  const permissionsPerRole = roleIds.map((roleId) => {
    const rolePermissions = rolesPermissions[roleId];

    return isDefined(rolePermissions)
      ? restrictObjectsPermissionsToDisabledActions({
          objectsPermissions: rolePermissions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          actingApplicationId: getActingApplicationId(roleId),
        })
      : undefined;
  });

  if (!permissionsPerRole.every(isDefined)) {
    return {};
  }

  return computePermissionIntersection(permissionsPerRole);
};
