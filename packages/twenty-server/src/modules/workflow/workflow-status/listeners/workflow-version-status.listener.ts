import { Injectable } from '@nestjs/common';

import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatusesUpdateJob,
  WorkflowVersionBatchEvent,
  WorkflowVersionEventType,
  WorkflowVersionStatusUpdate,
} from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WORKFLOW_VERSION_STATUS_UPDATED } from 'src/modules/workflow/workflow-status/constants/workflow-version-status-updated.constants';
import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';

@Injectable()
export class WorkflowVersionStatusListener {
  constructor(
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('workflowVersion', DatabaseEventAction.CREATED)
  async handleWorkflowVersionCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
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
    batchEvent: WorkspaceEventBatch<WorkflowVersionStatusUpdate>,
  ): Promise<void> {
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
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
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
