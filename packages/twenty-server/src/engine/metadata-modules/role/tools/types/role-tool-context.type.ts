// Caller identity forwarded to the services, which enforce the caller-aware
// rules (self role change, lockout protection).
export type RoleToolContext = {
  workspaceId: string;
  callerRoleIds: string[];
  callerUserWorkspaceId?: string;
};
