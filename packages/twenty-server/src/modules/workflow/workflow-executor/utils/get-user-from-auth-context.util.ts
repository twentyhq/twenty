import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

// Spread into a logic function call: a platform-started run contributes nothing rather than null fields
export const getUserFromAuthContext = (
  authContext: WorkspaceAuthContext,
): { userId?: string; userWorkspaceId?: string } =>
  isUserAuthContext(authContext)
    ? {
        userId: authContext.user.id,
        userWorkspaceId: authContext.userWorkspaceId,
      }
    : {};
