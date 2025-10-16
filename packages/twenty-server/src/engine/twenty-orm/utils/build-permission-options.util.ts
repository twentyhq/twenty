import { type RoleContext } from 'src/engine/metadata-modules/role/types/role-context.type';

export const buildPermissionOptions = (
  roleContext: RoleContext,
):
  | { roleId: string }
  | { roleIds: { intersection: string[] } }
  | { shouldBypassPermissionChecks: true } => {
  if (roleContext.roleId) {
    return { roleId: roleContext.roleId };
  }

  if (roleContext.roleIds) {
    return { roleIds: { intersection: roleContext.roleIds } };
  }

  return { shouldBypassPermissionChecks: true };
};
