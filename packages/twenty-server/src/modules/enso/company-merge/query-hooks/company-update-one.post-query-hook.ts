import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { enqueueCompanyDedup } from 'src/modules/enso/company-merge/query-hooks/enqueue-company-dedup.util';

// A registration number / domain may be added to a company on update — re-check
// for duplicates. The worker no-ops unless ≥2 live companies share an identity.
@Injectable()
@WorkspaceQueryHook({
  key: `company.updateOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class CompanyMergeCompanyUpdateOnePostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    @InjectMessageQueue(MessageQueue.ensoCompanyMergeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: unknown,
  ): Promise<void> {
    const workspaceId = authContext.workspace?.id;

    if (!isDefined(workspaceId)) {
      return;
    }

    await enqueueCompanyDedup(this.messageQueueService, workspaceId, payload);
  }
}
