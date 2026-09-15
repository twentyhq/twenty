import { isDefined } from 'twenty-shared/utils';

import { type FlatPermissionFlagMaps } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag-maps.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type RolePermissionFlagDTO } from 'src/engine/metadata-modules/role-permission-flag/dtos/role-permission-flag.dto';

export const fromFlatRolePermissionFlagToRolePermissionFlagDto = (
  flatRolePermissionFlag: FlatRolePermissionFlag,
  flatPermissionFlagMaps: FlatPermissionFlagMaps,
): RolePermissionFlagDTO => {
  const permissionFlag =
    flatPermissionFlagMaps.byUniversalIdentifier[
      flatRolePermissionFlag.permissionFlagUniversalIdentifier
    ];

  if (!isDefined(permissionFlag)) {
    throw new PermissionsException(
      `Permission flag ${flatRolePermissionFlag.permissionFlagUniversalIdentifier} not found`,
      PermissionsExceptionCode.PERMISSION_NOT_FOUND,
    );
  }

  return {
    id: flatRolePermissionFlag.id,
    roleId: flatRolePermissionFlag.roleId,
    flag: permissionFlag.key,
  };
};
