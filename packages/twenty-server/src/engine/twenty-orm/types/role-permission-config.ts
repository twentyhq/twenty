type RoleId = string;

export type RolePermissionConfig =
  | { shouldBypassPermissionChecks: true }
  | { unionOf: RoleId[] }
  | { intersectionOf: RoleId[] };
