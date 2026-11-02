/* @license Enterprise */

export type PermissionsPrincipal = {
  workspaceId: string;
  roleIds: string[];
  workspaceMemberId?: string;
  applicationId?: string;
};
