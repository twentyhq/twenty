import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPermissionFlagMaps } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag-maps.type';
import { synthesizeFlatPermissionFlagFromFlag } from 'src/engine/metadata-modules/flat-permission-flag/utils/synthesize-flat-permission-flag-from-flag.util';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type RolePermissionFlagDTO } from 'src/engine/metadata-modules/role-permission-flag/dtos/role-permission-flag.dto';

export const fromFlatRolePermissionFlagToRolePermissionFlagDto = (
  flatRolePermissionFlag: FlatRolePermissionFlag,
  flatPermissionFlagMaps: FlatPermissionFlagMaps,
): RolePermissionFlagDTO => {
  const catalogPermissionFlag = isDefined(
    flatRolePermissionFlag.permissionFlagUniversalIdentifier,
  )
    ? flatPermissionFlagMaps.byUniversalIdentifier[
        flatRolePermissionFlag.permissionFlagUniversalIdentifier
      ]
    : undefined;

  const permissionFlag = isDefined(catalogPermissionFlag)
    ? catalogPermissionFlag
    : synthesizeFlatPermissionFlagFromFlag({
        flag: flatRolePermissionFlag.flag,
        workspaceId: flatRolePermissionFlag.workspaceId,
        applicationId: flatRolePermissionFlag.applicationId,
        applicationUniversalIdentifier:
          flatRolePermissionFlag.applicationUniversalIdentifier,
      });

  return {
    id: flatRolePermissionFlag.id,
    roleId: flatRolePermissionFlag.roleId,
    flag: permissionFlag.key as PermissionFlagType,
  };
};
