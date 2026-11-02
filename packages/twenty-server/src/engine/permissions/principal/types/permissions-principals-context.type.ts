/* @license Enterprise */

// TODO(@charlesBochet): drop isDeprecatedRoleOnly once every caller names the principal holding the role
export type PermissionsDeprecatedRoleOnlyPrincipal = {
  roleId: string;
  isDeprecatedRoleOnly: true;
};

export type PermissionsMainPrincipal =
  | { workspaceMemberId: string }
  | { apiKeyId: string }
  | { agentId: string }
  | { webhookId: string }
  | { applicationId: string }
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsLimitingPrincipal =
  | { agentId: string }
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsApplicationPrincipal =
  | { applicationId: string }
  | { isCustomApp: true }
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsPrincipalsContext = {
  workspaceId: string;
  mainPrincipal: PermissionsMainPrincipal;
  limitingPrincipal?: PermissionsLimitingPrincipal;
  applicationPrincipal: PermissionsApplicationPrincipal;
};
