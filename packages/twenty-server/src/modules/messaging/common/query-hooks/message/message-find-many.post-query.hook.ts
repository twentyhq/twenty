import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { ApplyMessagesVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message/apply-messages-visibility-restrictions.service';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@WorkspaceQueryHook({
  key: `message.findMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class MessageFindManyPostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly applyMessagesVisibilityRestrictionsService: ApplyMessagesVisibilityRestrictionsService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: MessageWorkspaceEntity[],
  ): Promise<void> {
    const isTwentyStandardApplication =
      authContext.type === 'application' &&
      authContext.application.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier;

    if (
      authContext.type !== 'user' &&
      authContext.type !== 'apiKey' &&
      !isTwentyStandardApplication
    ) {
      throw new ForbiddenError('Authentication is required');
    }

    const workspace = authContext.workspace;

    if (!workspace) {
      throw new ForbiddenError('Workspace is required');
    }

    const userId = isUserAuthContext(authContext)
      ? authContext.user.id
      : undefined;

    await this.applyMessagesVisibilityRestrictionsService.applyMessagesVisibilityRestrictions(
      payload,
      workspace.id,
      userId,
    );
  }
}
