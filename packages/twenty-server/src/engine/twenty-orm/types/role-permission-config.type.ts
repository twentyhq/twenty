import { type PermissionPrincipal } from 'src/engine/twenty-orm/types/permission-principal.type';

// null: this actor takes part but has no role, so nothing is allowed
export type RoleIdsBySource = {
  userWorkspaceRoleId?: string | null;
  apiKeyRoleId?: string | null;
  applicationRoleId?: string | null;
  agentRoleId?: string | null;
};

export type PrincipalBySource = Partial<
  Record<keyof RoleIdsBySource, PermissionPrincipal>
>;

export type RolePermissionConfig =
  | { shouldBypassPermissionChecks: true }
  | { intersectionOf: RoleIdsBySource; principalBySource?: PrincipalBySource };
