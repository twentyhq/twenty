import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { extractRowRefs } from 'src/modules/enso/person-relationship/query-hooks/extract-row-refs.util';
import { RecordActivityAttributionJob } from 'src/modules/enso/lead-pipeline/jobs/record-activity-attribution.job';
import { ResolveOpportunityFromActivityJob } from 'src/modules/enso/lead-pipeline/jobs/resolve-opportunity-from-activity.job';
import {
  type RecordActivityAttributionJobData,
  type ResolveOpportunityFromActivityJobData,
} from 'src/modules/enso/lead-pipeline/jobs/lead-pipeline-job.types';

// Pipeline trigger: every inbound activity (regardless of channel) kicks off
// opportunity resolution + routing. The hook is intentionally thin — it only
// enqueues; all business logic (dedup, create, route, notify) runs in the
// worker so the activity write stays fast and atomic and downstream failures
// are retried independently.
@Injectable()
@WorkspaceQueryHook({
  key: `inboundActivity.createOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class InboundActivityCreateOnePostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    @InjectMessageQueue(MessageQueue.ensoLeadPipelineQueue)
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

    for (const ref of extractRowRefs(payload)) {
      // Attribution first, and unconditionally: what the activity says about
      // the person holds whether or not it becomes a deal. The job id keys the
      // enqueue to the activity — the timeline insert it drives has no dedup.
      await this.messageQueueService.add<RecordActivityAttributionJobData>(
        RecordActivityAttributionJob.name,
        { workspaceId, activityId: ref.id },
        { id: `enso-activity-attribution:${ref.id}` },
      );

      await this.messageQueueService.add<ResolveOpportunityFromActivityJobData>(
        ResolveOpportunityFromActivityJob.name,
        { workspaceId, activityId: ref.id },
      );
    }
  }
}
