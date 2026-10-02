import { isDefined } from 'twenty-shared/utils';

import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const getFlatRolePermissionFlagUniversalIdentifiers = ({
  flatRole,
  flatRolePermissionFlagMaps,
}: {
  flatRole: FlatRole;
  flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
}): Set<string> => {
  const permissionFlagUniversalIdentifiers = new Set<string>();

  for (const rolePermissionFlagId of flatRole.rolePermissionFlagIds) {
    const rolePermissionFlagUniversalIdentifier =
      flatRolePermissionFlagMaps.universalIdentifierById[rolePermissionFlagId];

    const permissionFlagUniversalIdentifier = isDefined(
      rolePermissionFlagUniversalIdentifier,
    )
      ? flatRolePermissionFlagMaps.byUniversalIdentifier[
          rolePermissionFlagUniversalIdentifier
        ]?.permissionFlagUniversalIdentifier
      : undefined;

    if (isDefined(permissionFlagUniversalIdentifier)) {
      permissionFlagUniversalIdentifiers.add(permissionFlagUniversalIdentifier);
    }
  }

  return permissionFlagUniversalIdentifiers;
};
