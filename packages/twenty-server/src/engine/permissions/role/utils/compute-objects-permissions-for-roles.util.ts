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
import { getPermissionsPrincipalActingApplicationId } from 'src/engine/permissions/principal/utils/get-permissions-principal-acting-application-id.util';
import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';
import { computePermissionIntersection } from 'src/engine/permissions/role/utils/compute-permission-intersection.util';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/permissions/role/utils/restrict-objects-permissions-to-disabled-actions.util';
import { restrictObjectsPermissionsToScope } from 'src/engine/permissions/role/utils/restrict-objects-permissions-to-scope.util';

export const computeObjectsPermissionsForRoles = ({
  principal,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatApplicationMaps,
}: {
  principal: Pick<
    PermissionsPrincipalsWithRolesContext,
    'mainPrincipal' | 'limitingPrincipal' | 'applicationPrincipal' | 'scope'
  >;
  rolesPermissions: ObjectsPermissionsByRoleId;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): ObjectsPermissions => {
  const roleIds = getPermissionsPrincipalRoleIds(principal);

  if (!isNonEmptyArray(roleIds)) {
    return {};
  }

  const actingApplicationId = getPermissionsPrincipalActingApplicationId({
    principal,
    flatApplicationMaps,
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

  return isDefined(principal.scope)
    ? restrictObjectsPermissionsToScope({
        objectsPermissions,
        scope: principal.scope,
      })
    : objectsPermissions;
};
