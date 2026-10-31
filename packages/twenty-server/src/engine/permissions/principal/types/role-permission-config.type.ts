import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

// null: this actor takes part but has no role, so nothing is allowed
export type RoleIdsBySource = {
  userWorkspaceRoleId?: string | null;
  apiKeyRoleId?: string | null;
  applicationRoleId?: string | null;
  agentRoleId?: string | null;
};

export type RolePermissionConfig =
  | { shouldBypassPermissionChecks: true }
  | {
      intersectionOf: RoleIdsBySource;
      scope?: PermissionScope;
    };
