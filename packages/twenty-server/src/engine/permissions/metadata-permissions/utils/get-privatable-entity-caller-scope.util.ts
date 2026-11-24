import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PrivatableEntityCallerScope } from 'src/engine/permissions/metadata-permissions/types/privatable-entity-caller-scope.type';

export const getPrivatableEntityCallerScope = (
  authContext:
    | WorkspaceAuthContext
    | undefined = workspaceAuthContextStorage.getStore(),
): PrivatableEntityCallerScope => {
  if (!isDefined(authContext)) {
    return { type: 'shared' };
  }

  if (isSystemAuthContext(authContext)) {
    return { type: 'all' };
  }

  if (isUserAuthContext(authContext)) {
    return {
      type: 'sharedAndOwned',
      userWorkspaceId: authContext.userWorkspaceId,
    };
  }

  return { type: 'shared' };
};
