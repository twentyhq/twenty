import {
  type PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const flatRoleHasPermissionFlag = ({
  flatRole,
  permissionFlag,
  flatRolePermissionFlagMaps,
}: {
  flatRole: FlatRole;
  permissionFlag: PermissionFlagType;
  flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
}): boolean => {
  const permissionFlagUniversalIdentifier =
    SystemPermissionFlag[permissionFlag];

  return flatRole.rolePermissionFlagIds.some((rolePermissionFlagId) => {
    const rolePermissionFlagUniversalIdentifier =
      flatRolePermissionFlagMaps.universalIdentifierById[rolePermissionFlagId];

    if (!isDefined(rolePermissionFlagUniversalIdentifier)) {
      return false;
    }

    return (
      flatRolePermissionFlagMaps.byUniversalIdentifier[
        rolePermissionFlagUniversalIdentifier
      ]?.permissionFlagUniversalIdentifier === permissionFlagUniversalIdentifier
    );
  });
};
