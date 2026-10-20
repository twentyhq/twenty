import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

// the application a member writes through, only when the request in progress is that member's own
export const resolveMessageSenderApplicationId = ({
  workspaceId,
  userWorkspaceId,
}: {
  workspaceId: string;
  userWorkspaceId?: string;
}): string | null => {
  const context = workspaceAuthContextStorage.getStore();

  return isDefined(context) &&
    isUserAuthContext(context) &&
    context.workspace.id === workspaceId &&
    context.userWorkspaceId === userWorkspaceId
    ? (context.application?.id ?? null)
    : null;
};
