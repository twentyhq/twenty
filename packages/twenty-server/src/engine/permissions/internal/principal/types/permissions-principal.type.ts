/* @license Enterprise */

export type PermissionsRolePrincipal = {
  type: 'role';
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
  | PermissionsRolePrincipal;

export type PermissionsLimitingPrincipal = PermissionsAgentPrincipal;

export type PermissionsApplicationPrincipal =
  | PermissionsApplicationIdPrincipal
  | PermissionsCustomApplicationPrincipal;
