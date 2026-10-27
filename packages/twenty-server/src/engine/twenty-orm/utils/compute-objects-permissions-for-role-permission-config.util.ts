import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ROLE_SOURCES_IN_INTERSECTION_ORDER } from 'src/engine/twenty-orm/constants/role-sources-in-intersection-order.constant';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { isDenyingRoleIdsBySource } from 'src/engine/twenty-orm/utils/is-denying-role-ids-by-source.util';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/twenty-orm/utils/restrict-objects-permissions-to-disabled-actions.util';

// Each role is restricted before the intersection, so a user acting through the owning application stays restricted
export const computeObjectsPermissionsForRolePermissionConfig = ({
  intersectionOf,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatApplicationMaps,
}: {
  intersectionOf: RoleIdsBySource;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatApplicationMaps: FlatApplicationCacheMaps;
}): ObjectsPermissions => {
  if (isDenyingRoleIdsBySource(intersectionOf)) {
    return {};
  }

  const permissionsPerRole = ROLE_SOURCES_IN_INTERSECTION_ORDER.flatMap(
    (roleIdKey) => {
      const roleId = intersectionOf[roleIdKey];

      if (!isDefined(roleId)) {
        return [];
      }

      const rolePermissions = rolesPermissions[roleId];

      return [
        isDefined(rolePermissions)
          ? restrictObjectsPermissionsToDisabledActions({
              objectsPermissions: rolePermissions,
              flatObjectMetadataMaps,
              flatApplicationMaps,
              applicationRoleId:
                roleIdKey === 'applicationRoleId' ? roleId : undefined,
            })
          : undefined,
      ];
    },
  );

  if (!permissionsPerRole.every(isDefined)) {
    return {};
  }

  return computePermissionIntersection([...new Set(permissionsPerRole)]);
};
