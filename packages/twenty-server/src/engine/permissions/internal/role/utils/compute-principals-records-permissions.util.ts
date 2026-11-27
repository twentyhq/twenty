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
import { computePermissionUnion } from 'src/engine/permissions/internal/role/utils/compute-permission-union.util';
import { restrictRecordsPermissionsToDisabledActions } from 'src/engine/permissions/internal/role/utils/restrict-records-permissions-to-disabled-actions.util';
import { toLimitingRoleRecordsPermissions } from 'src/engine/permissions/internal/role/utils/to-limiting-role-records-permissions.util';
import { restrictRecordsPermissionsToRuntimeLimitingRole } from 'src/engine/permissions/internal/role/utils/restrict-records-permissions-to-runtime-limiting-role.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { type TemporaryChannelWriteAccess } from 'src/engine/permissions/channel-visibility/types/temporary-channel-write-access.type';
import { findTemporaryChannelWriteAccessRoleIds } from 'src/engine/permissions/channel-visibility/utils/find-temporary-channel-write-access-role-ids.util';
import { restoreChannelWriteAccess } from 'src/engine/permissions/channel-visibility/utils/restore-channel-write-access.util';

export const computePrincipalsRecordsPermissions = ({
  principals,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  temporaryChannelWriteAccess,
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
  temporaryChannelWriteAccess?: TemporaryChannelWriteAccess;
}): RoleRecordsPermissions => {
  const actingApplication = getPermissionsPrincipalsActingApplication({
    principals,
  });

  const temporaryChannelWriteAccessRoleIds = isDefined(
    temporaryChannelWriteAccess,
  )
    ? findTemporaryChannelWriteAccessRoleIds({
        mainPrincipal: principals.mainPrincipal,
        temporaryChannelWriteAccess,
      })
    : [];

  const findMainRoleRecordsPermissions = (
    roleId: string,
  ): RoleRecordsPermissions | undefined => {
    const roleRecordsPermissions = rolesPermissions[roleId];

    if (
      !isDefined(roleRecordsPermissions) ||
      !isDefined(temporaryChannelWriteAccess) ||
      !temporaryChannelWriteAccessRoleIds.includes(roleId)
    ) {
      return roleRecordsPermissions;
    }

    const writeAccess = temporaryChannelWriteAccess.writeAccessByRoleId[roleId];

    if (!isDefined(writeAccess)) {
      return roleRecordsPermissions;
    }

    return restoreChannelWriteAccess({
      recordsPermissions: roleRecordsPermissions,
      objectMetadataIds: temporaryChannelWriteAccess.objectMetadataIds,
      writeAccess,
    });
  };

  const restrictToDisabledActions = ({
    roleId,
    isLimitingRole,
  }: {
    roleId: string;
    isLimitingRole: boolean;
  }) => {
    const roleRecordsPermissions = isLimitingRole
      ? rolesPermissions[roleId]
      : findMainRoleRecordsPermissions(roleId);

    if (!isDefined(roleRecordsPermissions)) {
      return undefined;
    }

    return restrictRecordsPermissionsToDisabledActions({
      recordsPermissions: isLimitingRole
        ? toLimitingRoleRecordsPermissions(roleRecordsPermissions)
        : roleRecordsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      actingApplicationId: actingApplication?.roleIds.includes(roleId)
        ? actingApplication.applicationId
        : undefined,
    });
  };

  const mainRecordsPermissionsPerRole = principals.mainPrincipal.roleIds.map(
    (roleId) => restrictToDisabledActions({ roleId, isLimitingRole: false }),
  );
  const limitingRecordsPermissionsPerRole =
    getPermissionsPrincipalsLimitingRoleIds(principals).map((roleId) =>
      restrictToDisabledActions({ roleId, isLimitingRole: true }),
    );

  if (
    !mainRecordsPermissionsPerRole.every(isDefined) ||
    !limitingRecordsPermissionsPerRole.every(isDefined)
  ) {
    return NO_ROLE_RECORDS_PERMISSIONS;
  }

  const recordsPermissionsPerRole = [
    computePermissionUnion(mainRecordsPermissionsPerRole),
    ...limitingRecordsPermissionsPerRole,
  ];

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
