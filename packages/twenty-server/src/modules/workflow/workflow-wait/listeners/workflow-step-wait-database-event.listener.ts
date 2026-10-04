import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { resolveAutomationAdmittedRecordIds } from 'src/modules/workflow/workflow-trigger/automated-trigger/utils/resolve-automation-admitted-record-ids.util';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';
import { buildWorkflowWaitEvent } from 'src/modules/workflow/workflow-wait/utils/build-workflow-wait-event.util';
import { doesEventMatchWait } from 'src/modules/workflow/workflow-wait/utils/does-event-match-wait.util';

@Injectable()
export class WorkflowStepWaitDatabaseEventListener {
  constructor(
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessPolicyService: RecordAccessPolicyService,
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

      await this.workflowStepWaitWorkspaceService.scheduleResolution({
        workspaceId,
        workflowRunId: eventWait.workflowRunId,
        waitId: eventWait.id,
        event: buildWorkflowWaitEvent({ eventName, event: matchingEvent }),
      });
    }
  }
}
