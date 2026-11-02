/* @license Enterprise */

// Role grants need every role in roleIds; creator and share grants add on top of them
export type PermissionsPrincipal = {
  workspaceId: string;
  roleIds: string[];
  workspaceMemberId?: string;
  applicationId?: string;
};
