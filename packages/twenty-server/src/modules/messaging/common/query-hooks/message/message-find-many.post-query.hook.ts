import { WorkspaceQueryPostHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@WorkspaceQueryHook({
  key: `message.findMany`,
  type: WorkspaceQueryHookType.PostHook,
})
export class MessageFindManyPostQueryHook
  implements WorkspaceQueryPostHookInstance
{
  constructor(
    private readonly applyMessagesVisibilityRestrictionsService: ApplyMessagesVisibilityRestrictionsService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: MessageWorkspaceEntity[],
  ): Promise<void> {
    if (!authContext.workspaceMemberId) {
      throw new UserInputError('Workspace member id is required');
    }

    await this.applyMessagesVisibilityRestrictionsService.applyMessagesVisibilityRestrictions(
      authContext.workspaceMemberId,
      payload,
    );
  }
}
