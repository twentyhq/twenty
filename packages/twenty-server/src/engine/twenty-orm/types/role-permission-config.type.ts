type RoleId = string;

// null: this actor takes part but has no role, so nothing is allowed
export type RoleRestriction = RoleId | null;

export type RoleIdsBySource = {
  userWorkspaceRoleId?: RoleRestriction;
  apiKeyRoleId?: RoleRestriction;
  applicationRoleId?: RoleRestriction;
  agentRoleId?: RoleRestriction;
};

export type RolePermissionConfig =
  | { shouldBypassPermissionChecks: true }
  | { intersectionOf: RoleIdsBySource };
