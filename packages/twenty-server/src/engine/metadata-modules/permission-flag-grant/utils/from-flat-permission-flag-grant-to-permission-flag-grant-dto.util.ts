import { type FlatPermissionFlagGrant } from 'src/engine/metadata-modules/flat-permission-flag-grant/types/flat-permission-flag-grant.type';
import { type PermissionFlagGrantDTO } from 'src/engine/metadata-modules/permission-flag-grant/dtos/permission-flag-grant.dto';

export const fromFlatPermissionFlagGrantToPermissionFlagGrantDto = (
  flatPermissionFlagGrant: FlatPermissionFlagGrant,
): PermissionFlagGrantDTO => ({
  id: flatPermissionFlagGrant.id,
  roleId: flatPermissionFlagGrant.roleId,
  flag: flatPermissionFlagGrant.flag,
});
