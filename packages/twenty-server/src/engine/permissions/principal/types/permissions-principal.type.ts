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

export type PermissionsEphemeralRolePrincipal = {
  type: 'ephemeralRole';
  permissions: PermissionScope;
};

export type PermissionsLimitingPrincipal =
  | PermissionsAgentPrincipal
  | PermissionsEphemeralRolePrincipal
  | PermissionsDeprecatedRoleOnlyPrincipal;

export type PermissionsApplicationPrincipal =
  | PermissionsApplicationIdPrincipal
  | PermissionsCustomApplicationPrincipal
  | PermissionsDeprecatedRoleOnlyPrincipal;
