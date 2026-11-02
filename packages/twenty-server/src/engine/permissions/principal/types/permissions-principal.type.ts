/* @license Enterprise */

// null roleId: the slot takes part without a role, so no role grants anything
export type PermissionsPrincipalMain =
  | { roleId: string | null }
  | { roleId: string | null; workspaceMemberId: string }
  | { roleId: string | null; apiKeyId: string }
  | { roleId: string | null; agentId: string }
  | { roleId: string | null; applicationId: string }
  | { roleId: string | null; webhookId: string };

export type PermissionsPrincipalMainActor =
  | { workspaceMemberId: string }
  | { apiKeyId: string }
  | { agentId: string }
  | { applicationId: string }
  | { webhookId: string };

export type PermissionsPrincipal = {
  workspaceId: string;
  main: PermissionsPrincipalMain;
  limitingRoleId?: string | null;
  appRoleId: string | null;
};
