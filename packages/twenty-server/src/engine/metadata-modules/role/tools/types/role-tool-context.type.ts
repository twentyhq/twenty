export type RoleToolContext = {
  workspaceId: string;
  // Roles the calling user or agent is currently acting under. Used to block
  // changes that would lock the caller out of role management.
  callerRoleIds: string[];
  callerWorkspaceMemberId?: string;
  callerUserWorkspaceId?: string;
};
