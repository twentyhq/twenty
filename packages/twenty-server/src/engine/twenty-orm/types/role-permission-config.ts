export type RolePermissionConfig =
  | { shouldBypassPermissionChecks: true }
  | { roleId: string }
  | { roleIds: { intersection: string[] } }
  | { roleIds: { union: string[] } };
