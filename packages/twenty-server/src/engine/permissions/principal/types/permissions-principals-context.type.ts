/* @license Enterprise */

// TODO(@charlesBochet): drop isDeprecatedRoleOnly once every caller knows the actor holding the role
type DeprecatedRoleOnly = { roleId: string; isDeprecatedRoleOnly: true };

export type PermissionsPrincipalMain =
  | { roleId: string; workspaceMemberId: string }
  | { roleId: string; apiKeyId: string }
  | { roleId: string; agentId: string }
  | { roleId: string; webhookId: string }
  | { roleId: string; applicationId: string }
  | DeprecatedRoleOnly;

export type PermissionsPrincipalLimiting =
  | { roleId: string; agentId: string }
  | DeprecatedRoleOnly;

export type PermissionsPrincipalApp =
  | { roleId: string; applicationId: string }
  | { isCustomApp: true }
  | DeprecatedRoleOnly;

export type PermissionsPrincipalsContext = {
  workspaceId: string;
  mainPrincipal: PermissionsPrincipalMain;
  limiting?: PermissionsPrincipalLimiting;
  app: PermissionsPrincipalApp;
};

export type PermissionsPrincipalActors = {
  main:
    | { workspaceMemberId: string }
    | { apiKeyId: string }
    | { agentId: string }
    | { applicationId: string }
    | { webhookId: string }
    | undefined;
  agentId: string | undefined;
  applicationId: string | undefined;
};
