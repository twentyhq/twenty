import { isDefined } from 'twenty-shared/utils';

import { WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@WorkspaceQueryHook({
  key: `message.findOne`,
  type: WorkspaceQueryHookType.PostHook,
})
export class MessageFindOnePostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly applyMessagesVisibilityRestrictionsService: ApplyMessagesVisibilityRestrictionsService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: MessageWorkspaceEntity[],
  ): Promise<void> {
    const { user, apiKey } = authContext;

    if (!isDefined(user) && !isDefined(apiKey)) {
      throw new ForbiddenError('User is required');
    }

    await this.applyMessagesVisibilityRestrictionsService.applyMessagesVisibilityRestrictions(
      payload,
      user?.id,
    );
  }
}
