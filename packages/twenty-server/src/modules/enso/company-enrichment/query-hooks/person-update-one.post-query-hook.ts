import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { enqueueCompanyResolution } from 'src/modules/enso/company-enrichment/query-hooks/enqueue-company-resolution.util';

// A work email may be added to an existing company-less person on update — give
// them a company too. The worker no-ops if the person is already linked.
@Injectable()
@WorkspaceQueryHook({
  key: `person.updateOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class CompanyEnrichmentPersonUpdateOnePostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    @InjectMessageQueue(MessageQueue.ensoCompanyEnrichmentQueue)
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

    await enqueueCompanyResolution(
      this.messageQueueService,
      workspaceId,
      payload,
    );
  }
}
