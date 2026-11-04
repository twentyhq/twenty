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
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsActingApplicationId } from 'src/engine/permissions/principal/utils/get-permissions-principals-acting-application-id.util';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principals-role-ids.util';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/permissions/role/utils/restrict-objects-permissions-to-disabled-actions.util';
import { restrictObjectsPermissionsToScope } from 'src/engine/permissions/role/utils/restrict-objects-permissions-to-scope.util';

export const computeObjectsPermissionsForRoles = ({
  principals,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatApplicationMaps,
}: {
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    | 'mainPrincipal'
    | 'limitingPrincipal'
    | 'applicationPrincipal'
    | 'aiRunScope'
  >;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): ObjectsPermissions => {
  const roleIds = getPermissionsPrincipalsRoleIds(principals);

  if (!isNonEmptyArray(roleIds)) {
    return {};
  }

  const actingApplicationId = getPermissionsPrincipalsActingApplicationId({
    principals,
  });

  const actingApplicationRoleId = isDefined(actingApplicationId)
    ? flatApplicationMaps.byId[actingApplicationId]?.defaultRoleId
    : undefined;

  const permissionsPerRole = roleIds.map((roleId) => {
    const rolePermissions = rolesPermissions[roleId];

    return isDefined(rolePermissions)
      ? restrictObjectsPermissionsToDisabledActions({
          objectsPermissions: rolePermissions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          actingApplicationId:
            roleId === actingApplicationRoleId
              ? actingApplicationId
              : undefined,
        })
      : undefined;
  });

  if (!permissionsPerRole.every(isDefined)) {
    return {};
  }

  const objectsPermissions = computePermissionIntersection(permissionsPerRole);

  return isDefined(principals.aiRunScope)
    ? restrictObjectsPermissionsToScope({
        objectsPermissions,
        aiRunScope: principals.aiRunScope,
      })
    : objectsPermissions;
};
