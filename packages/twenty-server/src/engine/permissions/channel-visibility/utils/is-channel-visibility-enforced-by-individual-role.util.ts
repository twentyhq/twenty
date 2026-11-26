import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

// Only workspace members always read channel records through an individual role; other callers may still hold role wide access
export const isChannelVisibilityEnforcedByIndividualRole = (
  authContext: WorkspaceAuthContext,
): boolean => isUserAuthContext(authContext);
