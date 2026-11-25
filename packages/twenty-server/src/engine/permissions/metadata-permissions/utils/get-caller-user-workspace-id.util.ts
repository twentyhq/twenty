import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const getCallerUserWorkspaceId = (
  authContext:
    | WorkspaceAuthContext
    | undefined = workspaceAuthContextStorage.getStore(),
): string | undefined =>
  isDefined(authContext) && isUserAuthContext(authContext)
    ? authContext.userWorkspaceId
    : undefined;
