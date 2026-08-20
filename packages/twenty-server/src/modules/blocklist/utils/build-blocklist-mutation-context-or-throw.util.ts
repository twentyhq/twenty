import { msg } from '@lingui/core/macro';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type BlocklistMutationContext } from 'src/modules/blocklist/types/blocklist-mutation-context.type';

export const buildBlocklistMutationContextOrThrow = (
  authContext: WorkspaceAuthContext,
): BlocklistMutationContext => {
  if (!isUserAuthContext(authContext)) {
    throw new CommonQueryRunnerException(
      'Blocklist entries can only be managed by an authenticated user',
      CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      {
        userFriendlyMessage: msg`You must be authenticated to manage the blocklist.`,
      },
    );
  }

  return {
    workspaceId: authContext.workspace.id,
    userWorkspaceId: authContext.userWorkspaceId,
    workspaceMemberId: authContext.workspaceMemberId,
  };
};
