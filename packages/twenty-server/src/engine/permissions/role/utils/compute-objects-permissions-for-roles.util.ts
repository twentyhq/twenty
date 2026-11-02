/* @license Enterprise */

import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/permissions/role/utils/restrict-objects-permissions-to-disabled-actions.util';

export const computeObjectsPermissionsForRoles = ({
  roleIds,
  applicationId,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatApplicationMaps,
}: Pick<PermissionsPrincipal, 'roleIds' | 'applicationId'> & {
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): ObjectsPermissions => {
  if (!isNonEmptyArray(roleIds)) {
    return {};
  }

  const actingApplicationRoleId = isDefined(applicationId)
    ? flatApplicationMaps.byId[applicationId]?.defaultRoleId
    : undefined;

  const permissionsPerRole = roleIds.map((roleId) => {
    const rolePermissions = rolesPermissions[roleId];

    return isDefined(rolePermissions)
      ? restrictObjectsPermissionsToDisabledActions({
          objectsPermissions: rolePermissions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          actingApplicationId:
            roleId === actingApplicationRoleId ? applicationId : undefined,
        })
      : undefined;
  });

  if (!permissionsPerRole.every(isDefined)) {
    return {};
  }

  return computePermissionIntersection(permissionsPerRole);
};
