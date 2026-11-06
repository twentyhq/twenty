/* @license Enterprise */

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/permissions/internal/principal/types/application-default-role-maps.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsActingApplicationId } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-acting-application-id.util';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { computePermissionIntersection } from 'src/engine/permissions/internal/role/utils/compute-permission-intersection.util';
import { restrictRecordsPermissionsToDisabledActions } from 'src/engine/permissions/internal/role/utils/restrict-records-permissions-to-disabled-actions.util';
import { restrictRecordsPermissionsToScope } from 'src/engine/permissions/internal/role/utils/restrict-records-permissions-to-scope.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const computePrincipalsRecordsPermissions = ({
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
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): RoleRecordsPermissions => {
  const roleIds = getPermissionsPrincipalsRoleIds(principals);

  if (!isNonEmptyArray(roleIds)) {
    return NO_ROLE_RECORDS_PERMISSIONS;
  }

  const actingApplicationId = getPermissionsPrincipalsActingApplicationId({
    principals,
  });

  const actingApplicationRoleId = isDefined(actingApplicationId)
    ? flatApplicationMaps.byId[actingApplicationId]?.defaultRoleId
    : undefined;

  const recordsPermissionsPerRole = roleIds.map((roleId) => {
    const roleRecordsPermissions = rolesPermissions[roleId];

    return isDefined(roleRecordsPermissions)
      ? restrictRecordsPermissionsToDisabledActions({
          recordsPermissions: roleRecordsPermissions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          actingApplicationId:
            roleId === actingApplicationRoleId
              ? actingApplicationId
              : undefined,
        })
      : undefined;
  });

  if (!recordsPermissionsPerRole.every(isDefined)) {
    return NO_ROLE_RECORDS_PERMISSIONS;
  }

  const recordsPermissions = computePermissionIntersection(
    recordsPermissionsPerRole,
  );

  return isDefined(principals.aiRunScope)
    ? restrictRecordsPermissionsToScope({
        recordsPermissions,
        aiRunScope: principals.aiRunScope,
      })
    : recordsPermissions;
};
