import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type RolePermissionFlagDTO } from 'src/engine/metadata-modules/role-permission-flag/dtos/role-permission-flag.dto';

export const fromFlatRolePermissionFlagToRolePermissionFlagDto = (
  flatRolePermissionFlag: FlatRolePermissionFlag,
): RolePermissionFlagDTO => ({
  id: flatRolePermissionFlag.id,
  roleId: flatRolePermissionFlag.roleId,
  flag: flatRolePermissionFlag.flag,
});
