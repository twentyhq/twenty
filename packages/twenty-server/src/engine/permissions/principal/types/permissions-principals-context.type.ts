/* @license Enterprise */

// TODO(@charlesBochet): drop isDeprecatedRoleOnly once every caller names the principal holding the role
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

export type PermissionsPrincipalApplication =
  | { roleId: string; applicationId: string }
  | { isCustomApp: true }
  | DeprecatedRoleOnly;

export type PermissionsPrincipalsContext = {
  workspaceId: string;
  mainPrincipal: PermissionsPrincipalMain;
  limitingPrincipal?: PermissionsPrincipalLimiting;
  applicationPrincipal: PermissionsPrincipalApplication;
};

export type PermissionsPrincipals = {
  mainPrincipal:
    | { workspaceMemberId: string }
    | { apiKeyId: string }
    | { agentId: string }
    | { applicationId: string }
    | { webhookId: string }
    | undefined;
  agentId: string | undefined;
  applicationId: string | undefined;
};
