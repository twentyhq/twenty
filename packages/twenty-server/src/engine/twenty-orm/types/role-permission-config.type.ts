type RoleId = string;

// null: this actor takes part but has no role, so nothing is allowed
export type RoleRestriction = RoleId | null;

export type RoleRestrictionsBySource = {
  userWorkspace?: RoleRestriction;
  apiKey?: RoleRestriction;
  application?: RoleRestriction;
  agent?: RoleRestriction;
};

export type RolePermissionConfig =
  | { shouldBypassPermissionChecks: true }
  | { intersectionOf: RoleRestrictionsBySource };
