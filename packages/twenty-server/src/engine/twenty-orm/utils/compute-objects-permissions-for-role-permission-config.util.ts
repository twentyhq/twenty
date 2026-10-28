import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
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
  flatApplicationMaps,
}: {
  intersectionOf: RoleIdsBySource;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): ObjectsPermissions => {
  const roleIds = getRoleIdsToIntersect(intersectionOf);

  if (!isDefined(roleIds)) {
    return {};
  }

  const applicationIdByDefaultRoleId =
    buildApplicationIdByDefaultRoleId(flatApplicationMaps);

  const permissionsPerRole = roleIds.map((roleId) => {
    const rolePermissions = rolesPermissions[roleId];

    return isDefined(rolePermissions)
      ? restrictObjectsPermissionsToDisabledActions({
          objectsPermissions: rolePermissions,
          flatObjectMetadataMaps,
          actingApplicationId: applicationIdByDefaultRoleId[roleId],
        })
      : undefined;
  });

  if (!permissionsPerRole.every(isDefined)) {
    return {};
  }

  return computePermissionIntersection(permissionsPerRole);
};
