import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';

export const getSenderApplicationIdFromAuthContext = ({
  workspaceId,
  userWorkspaceId,
}: {
  workspaceId: string;
  userWorkspaceId?: string;
}): string | null => {
  const context = workspaceAuthContextStorage.getStore();

  const applicationId =
    isDefined(context) &&
    isUserAuthContext(context) &&
    context.workspace.id === workspaceId &&
    context.userWorkspaceId === userWorkspaceId
      ? context.application?.id
      : undefined;

  return applicationId ?? null;
};
