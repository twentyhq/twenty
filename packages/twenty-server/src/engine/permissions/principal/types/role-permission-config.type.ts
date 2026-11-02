import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';

// null: this actor takes part but has no role, so nothing is allowed
export type RoleIdsBySource = {
  userWorkspaceRoleId?: string | null;
  apiKeyRoleId?: string | null;
  applicationRoleId?: string | null;
  agentRoleId?: string | null;
  webhookRoleId?: string | null;
};

export type RolePermissionConfig =
  | { shouldBypassPermissionChecks: true }
  | { intersectionOf: RoleIdsBySource };

// TODO(@charlesBochet): becomes RolePermissionConfig once intersectionOf is gone
export type RepositoryPermissionConfig =
  | RolePermissionConfig
  | { principals: PermissionsPrincipalsContext };
