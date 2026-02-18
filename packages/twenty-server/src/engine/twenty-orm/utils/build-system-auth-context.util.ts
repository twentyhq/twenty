import { type SystemWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildSystemAuthContext as buildSystemAuthContextUtil } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// Builds a minimal WorkspaceAuthContext for system operations (jobs, commands, crons)
// that don't have a user context but need to operate on a workspace
export const buildSystemAuthContext = (
  workspaceId: string,
): SystemWorkspaceAuthContext => {
  return buildSystemAuthContextUtil({
    workspace: { id: workspaceId } as WorkspaceEntity,
  });
};
