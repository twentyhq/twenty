import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
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
  flatRoleMaps,
}: {
  intersectionOf: RoleIdsBySource;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatRoleMaps: FlatRoleMaps;
}): ObjectsPermissions => {
  if (isDenyingRoleIdsBySource(intersectionOf)) {
    return {};
  }

  const permissionsPerSource = ROLE_SOURCES_IN_INTERSECTION_ORDER.flatMap(
    (roleSource) => {
      const roleId = intersectionOf[roleSource];

      return isDefined(roleId) ? [{ roleSource, roleId }] : [];
    },
  ).map(({ roleSource, roleId }) => {
    const rolePermissions = rolesPermissions[roleId];

    return isDefined(rolePermissions)
      ? restrictObjectsPermissionsToDisabledActions({
          objectsPermissions: rolePermissions,
          flatObjectMetadataMaps,
          roleSource,
          flatRole: findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: roleId,
            flatEntityMaps: flatRoleMaps,
          }),
        })
      : undefined;
  });

  if (!permissionsPerSource.every(isDefined)) {
    return {};
  }

  return computePermissionIntersection([...new Set(permissionsPerSource)]);
};
