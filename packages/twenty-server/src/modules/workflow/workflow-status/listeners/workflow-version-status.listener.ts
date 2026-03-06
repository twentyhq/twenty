import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
} from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatusesUpdateJob,
  type WorkflowVersionBatchEvent,
  WorkflowVersionEventType,
  type WorkflowVersionStatusUpdate,
} from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WORKFLOW_VERSION_STATUS_UPDATED } from 'src/modules/workflow/workflow-status/constants/workflow-version-status-updated.constants';
import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';

@Injectable()
export class WorkflowVersionStatusListener {
  constructor(
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.CREATED)
  async handleWorkflowVersionCreated(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    if (!isDefined(batchEvent.workspaceId)) {
      return;
    }

    const workflowIds = batchEvent.events
      .filter(
        (event) =>
          !event.properties.after.status ||
          event.properties.after.status === WorkflowVersionStatus.DRAFT,
      )
      .map((event) => event.properties.after.workflowId);

    if (workflowIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<WorkflowVersionBatchEvent>(
      WorkflowStatusesUpdateJob.name,
      {
        type: WorkflowVersionEventType.CREATE,
        workspaceId: batchEvent.workspaceId,
        workflowIds,
      },
    );
  }

  @OnCustomBatchEvent(WORKFLOW_VERSION_STATUS_UPDATED)
  async handleWorkflowVersionUpdated(
    batchEvent: CustomWorkspaceEventBatch<WorkflowVersionStatusUpdate>,
  ): Promise<void> {
    if (!isDefined(batchEvent.workspaceId)) {
      return;
    }

    await this.messageQueueService.add<WorkflowVersionBatchEvent>(
      WorkflowStatusesUpdateJob.name,
      {
        type: WorkflowVersionEventType.STATUS_UPDATE,
        workspaceId: batchEvent.workspaceId,
        statusUpdates: batchEvent.events,
      },
    );
  }

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.DELETED)
  async handleWorkflowVersionDeleted(
    batchEvent: CustomWorkspaceEventBatch<
      ObjectRecordDeleteEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    if (!isDefined(batchEvent.workspaceId)) {
      return;
    }

    const workflowIds = batchEvent.events
      .filter(
        (event) =>
          event.properties.before.status === WorkflowVersionStatus.DRAFT,
      )
      .map((event) => event.properties.before.workflowId);

    if (workflowIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<WorkflowVersionBatchEvent>(
      WorkflowStatusesUpdateJob.name,
      {
        type: WorkflowVersionEventType.DELETE,
        workspaceId: batchEvent.workspaceId,
        workflowIds,
      },
    );
  }
}
