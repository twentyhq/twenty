import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

export const resolveMessageSenderApplicationId = ({
  workspaceId,
  workspaceMemberId,
}: {
  workspaceId: string;
  workspaceMemberId?: string;
}): string | null => {
  const context = workspaceAuthContextStorage.getStore();

  if (!isDefined(context) || !isUserAuthContext(context)) {
    return null;
  }

  if (
    context.workspace.id !== workspaceId ||
    context.workspaceMemberId !== workspaceMemberId
  ) {
    return null;
  }

  return context.application?.id ?? null;
};
