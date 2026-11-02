/* @license Enterprise */

// null: the slot takes part without a role, so no role grants anything
export type PermissionsPrincipal = {
  workspaceId: string;
  main?: { roleId: string | null; workspaceMemberId?: string };
  limitingRoleId?: string | null;
  appRoleId?: string | null;
};
