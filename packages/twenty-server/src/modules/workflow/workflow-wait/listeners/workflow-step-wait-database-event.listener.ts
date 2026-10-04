import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { resolveAutomationAdmittedRecordIds } from 'src/modules/workflow/workflow-trigger/automated-trigger/utils/resolve-automation-admitted-record-ids.util';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { RESUME_WAITING_WORKFLOW_STEP_JOB_NAME } from 'src/modules/workflow/workflow-wait/constants/resume-waiting-workflow-step-job-name.constant';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';
import { type ResumeWaitingWorkflowStepJobData } from 'src/modules/workflow/workflow-wait/types/resume-waiting-workflow-step-job-data.type';
import { buildWorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/utils/build-workflow-wait-event.util';
import { doesEventMatchWait } from 'src/modules/workflow/workflow-wait/utils/does-event-match-wait.util';

@Injectable()
export class WorkflowStepWaitDatabaseEventListener {
  constructor(
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleObjectRecordCreateEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    await this.resumeMatchingWaits(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleObjectRecordUpdateEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    await this.resumeMatchingWaits(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DELETED)
  async handleObjectRecordDeleteEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    await this.resumeMatchingWaits(payload);
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPSERTED)
  async handleObjectRecordUpsertEvent(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ) {
    await this.resumeMatchingWaits(payload);
  }

  private async resumeMatchingWaits(
    payload: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const { workspaceId, name: eventName } = payload;

    if (!isNonEmptyString(workspaceId) || !isNonEmptyString(eventName)) {
      return;
    }

    const eventWaits =
      await this.workflowStepWaitWorkspaceService.findEventWaits({
        workspaceId,
        eventName,
      });

    if (eventWaits.length === 0) {
      return;
    }

    const admittedRecordIds = await resolveAutomationAdmittedRecordIds({
      payload,
      workspaceCacheService: this.workspaceCacheService,
      recordAccessPolicyService: this.recordAccessPolicyService,
    });

    for (const eventWait of eventWaits) {
      const matchingEvent = payload.events.find(
        (event) =>
          admittedRecordIds.has(event.recordId) &&
          doesEventMatchWait({ wait: eventWait.wait, event }),
      );

      if (!isDefined(matchingEvent)) {
        continue;
      }

      await this.messageQueueService.add<ResumeWaitingWorkflowStepJobData>(
        RESUME_WAITING_WORKFLOW_STEP_JOB_NAME,
        {
          workspaceId,
          waitId: eventWait.id,
          event: buildWorkflowWaitEvent({ eventName, event: matchingEvent }),
        },
        buildRunWorkflowJobOptions(eventWait.workflowRunId),
      );
    }
  }
}
