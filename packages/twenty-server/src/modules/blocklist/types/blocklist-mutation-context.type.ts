import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type BlocklistMutationContext = {
  workspaceId: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  authContext: WorkspaceAuthContext;
};
