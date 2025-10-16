export const buildPermissionOptions = (roleContext: {
  roleId?: string;
  roleIds?: string[];
}):
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
