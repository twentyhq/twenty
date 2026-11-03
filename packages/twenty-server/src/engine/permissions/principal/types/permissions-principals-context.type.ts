/* @license Enterprise */

import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

// TODO(@charlesBochet): drop deprecatedRoleOnly once every caller names the principal holding the role
export type PermissionsDeprecatedRoleOnlyPrincipal = {
  type: 'deprecatedRoleOnly';
  roleId: string;
};

export type PermissionsWorkspaceMemberPrincipal = {
  type: 'workspaceMember';
  workspaceMemberId: string;
};

export type PermissionsApiKeyPrincipal = {
  type: 'apiKey';
  apiKeyId: string;
};

export type PermissionsAgentPrincipal = {
  type: 'agent';
  agentId: string;
};

export type PermissionsWebhookPrincipal = {
  type: 'webhook';
  webhookId: string;
};

export type PermissionsApplicationIdPrincipal = {
  type: 'application';
  applicationId: string;
};

export type PermissionsCustomApplicationPrincipal = {
  type: 'customApplication';
};

export type PermissionsMainPrincipal =
  | PermissionsWorkspaceMemberPrincipal
  | PermissionsApiKeyPrincipal
  | PermissionsAgentPrincipal
  | PermissionsWebhookPrincipal
  | PermissionsApplicationIdPrincipal
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsLimitingPrincipal =
  | PermissionsAgentPrincipal
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsApplicationPrincipal =
  | PermissionsApplicationIdPrincipal
  | PermissionsCustomApplicationPrincipal
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsPrincipalsContext = {
  workspaceId: string;
  mainPrincipal: PermissionsMainPrincipal;
  limitingPrincipal?: PermissionsLimitingPrincipal;
  applicationPrincipal: PermissionsApplicationPrincipal;
  // narrows what the roles allow, and leaves no reach beyond them
  scope?: PermissionScope;
};
