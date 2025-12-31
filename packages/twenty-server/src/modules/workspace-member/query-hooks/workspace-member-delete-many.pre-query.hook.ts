import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type DeleteManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@WorkspaceQueryHook(`workspaceMember.deleteMany`)
export class WorkspaceMemberDeleteManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor() {}

  async execute(_authContext: AuthContext): Promise<DeleteManyResolverArgs> {
    throw new CommonQueryRunnerException(
      'Please use /deleteUserFromWorkspace to remove a workspace member.',
      CommonQueryRunnerExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`Please use Settings to remove a workspace member.`,
      },
    );
  }
}
