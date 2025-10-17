import { type RoleContext } from 'src/engine/metadata-modules/role/types/role-context.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export const buildPermissionOptions = (
  roleContext: RoleContext,
): RolePermissionConfig | undefined => {
  if (roleContext.shouldBypassPermissionChecks) {
    return { shouldBypassPermissionChecks: true };
  }

  if (roleContext.roleId) {
    return { roleId: roleContext.roleId };
  }

  if (roleContext.roleIds) {
    return { roleIds: { intersection: roleContext.roleIds } };
  }
};
