/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsActingApplication } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-acting-application.util';
import { getPermissionsPrincipalsLimitingRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-limiting-role-ids.util';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { computePermissionIntersection } from 'src/engine/permissions/internal/role/utils/compute-permission-intersection.util';
import { restrictRecordsPermissionsToDisabledActions } from 'src/engine/permissions/internal/role/utils/restrict-records-permissions-to-disabled-actions.util';
import { toLimitingRoleRecordsPermissions } from 'src/engine/permissions/internal/role/utils/to-limiting-role-records-permissions.util';
import { restrictRecordsPermissionsToRuntimeLimitingRole } from 'src/engine/permissions/internal/role/utils/restrict-records-permissions-to-runtime-limiting-role.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const computePrincipalsRecordsPermissions = ({
  principals,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  principals: Pick<
    PermissionsPrincipalsWithRolesContext,
    | 'mainPrincipal'
    | 'limitingPrincipal'
    | 'applicationPrincipal'
    | 'runtimeLimitingRole'
  >;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): RoleRecordsPermissions => {
  const actingApplication = getPermissionsPrincipalsActingApplication({
    principals,
  });

  const restrictToDisabledActions = ({
    roleId,
    isLimitingRole,
  }: {
    roleId: string;
    isLimitingRole: boolean;
  }) => {
    const roleRecordsPermissions = rolesPermissions[roleId];

    if (!isDefined(roleRecordsPermissions)) {
      return undefined;
    }

    return restrictRecordsPermissionsToDisabledActions({
      recordsPermissions: isLimitingRole
        ? toLimitingRoleRecordsPermissions(roleRecordsPermissions)
        : roleRecordsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      actingApplicationId:
        roleId === actingApplication?.roleId
          ? actingApplication.applicationId
          : undefined,
    });
  };

  const recordsPermissionsPerRole = [
    restrictToDisabledActions({
      roleId: principals.mainPrincipal.roleId,
      isLimitingRole: false,
    }),
    ...getPermissionsPrincipalsLimitingRoleIds(principals).map((roleId) =>
      restrictToDisabledActions({ roleId, isLimitingRole: true }),
    ),
  ];

  if (!recordsPermissionsPerRole.every(isDefined)) {
    return NO_ROLE_RECORDS_PERMISSIONS;
  }

  const recordsPermissions = computePermissionIntersection(
    recordsPermissionsPerRole,
  );

  return isDefined(principals.runtimeLimitingRole)
    ? restrictRecordsPermissionsToRuntimeLimitingRole({
        recordsPermissions,
        runtimeLimitingRole: principals.runtimeLimitingRole,
      })
    : recordsPermissions;
};
