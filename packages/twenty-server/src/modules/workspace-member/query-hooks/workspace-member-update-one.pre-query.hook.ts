import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getWorkspaceMemberNameTooLongMessage } from 'src/engine/core-modules/user/utils/get-workspace-member-name-too-long-message.util';
import { trimWorkspaceMemberName } from 'src/engine/core-modules/user/utils/trim-workspace-member-name.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceQueryHook(`workspaceMember.updateOne`)
export class WorkspaceMemberUpdateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<Partial<WorkspaceMemberWorkspaceEntity>>,
  ): Promise<UpdateOneResolverArgs<Partial<WorkspaceMemberWorkspaceEntity>>> {
    const nameTooLongMessage = getWorkspaceMemberNameTooLongMessage({
      name: payload.data.name,
    });

    if (isDefined(nameTooLongMessage)) {
      throw new CommonQueryRunnerException(
        'Workspace member name exceeds its max length',
        CommonQueryRunnerExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: nameTooLongMessage },
      );
    }

    if (!isDefined(payload.data.name)) {
      return payload;
    }

    return {
      ...payload,
      data: {
        ...payload.data,
        name: trimWorkspaceMemberName(payload.data.name),
      },
    };
  }
}
