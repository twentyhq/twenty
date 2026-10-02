import { type PermissionFlagType } from 'twenty-shared/constants';

import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { getFlatRolePermissionFlagUniversalIdentifiers } from 'src/engine/metadata-modules/flat-role/utils/get-flat-role-permission-flag-universal-identifiers.util';
import { isPermissionFlagGranted } from 'src/engine/metadata-modules/permissions/utils/is-permission-flag-granted.util';

export const isPermissionFlagGrantedToFlatRole = ({
  flatRole,
  permissionFlag,
  flatRolePermissionFlagMaps,
}: {
  flatRole: FlatRole;
  permissionFlag: PermissionFlagType;
  flatRolePermissionFlagMaps: FlatRolePermissionFlagMaps;
}): boolean =>
  isPermissionFlagGranted({
    role: flatRole,
    permissionFlag,
    assignedPermissionFlagUniversalIdentifiers:
      getFlatRolePermissionFlagUniversalIdentifiers({
        flatRole,
        flatRolePermissionFlagMaps,
      }),
  });
