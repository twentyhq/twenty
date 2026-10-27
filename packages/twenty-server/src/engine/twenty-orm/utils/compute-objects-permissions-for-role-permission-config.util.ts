import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ROLE_SOURCES_IN_INTERSECTION_ORDER } from 'src/engine/twenty-orm/constants/role-sources-in-intersection-order.constant';
import {
  type PrincipalBySource,
  type RoleIdsBySource,
} from 'src/engine/twenty-orm/types/role-permission-config.type';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { isDenyingRoleIdsBySource } from 'src/engine/twenty-orm/utils/is-denying-role-ids-by-source.util';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/twenty-orm/utils/restrict-objects-permissions-to-disabled-actions.util';

// Each role is restricted with its own principal before the intersection, so only the source the exemption belongs to keeps it
export const computeObjectsPermissionsForRolePermissionConfig = ({
  intersectionOf,
  principalBySource = {},
  rolesPermissions,
  flatObjectMetadataMaps,
}: {
  intersectionOf: RoleIdsBySource;
  principalBySource?: PrincipalBySource;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): ObjectsPermissions => {
  if (isDenyingRoleIdsBySource(intersectionOf)) {
    return {};
  }

  const permissionsPerSource = ROLE_SOURCES_IN_INTERSECTION_ORDER.flatMap(
    (source) => {
      const roleId = intersectionOf[source];

      return isDefined(roleId)
        ? [{ roleId, principal: principalBySource[source] }]
        : [];
    },
  ).map(({ roleId, principal }) => {
    const rolePermissions = rolesPermissions[roleId];

    return isDefined(rolePermissions)
      ? restrictObjectsPermissionsToDisabledActions({
          objectsPermissions: rolePermissions,
          flatObjectMetadataMaps,
          principal,
        })
      : undefined;
  });

  if (!permissionsPerSource.every(isDefined)) {
    return {};
  }

  return computePermissionIntersection([...new Set(permissionsPerSource)]);
};
