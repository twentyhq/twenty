import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

// Builds a minimal WorkspaceAuthContext for system operations (jobs, commands, crons)
// that don't have a user context but need to operate on a workspace
export const buildSystemAuthContext = (
  workspaceId: string,
): WorkspaceAuthContext => {
  return {
    user: null,
    workspace: { id: workspaceId } as WorkspaceAuthContext['workspace'],
    workspaceMemberId: undefined,
    userWorkspaceId: undefined,
    apiKey: null,
  } as WorkspaceAuthContext;
};
