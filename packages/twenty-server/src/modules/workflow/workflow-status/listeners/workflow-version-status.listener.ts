import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatusesUpdateJob,
  WorkflowVersionBatchEvent,
  WorkflowVersionEventType,
} from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';

@Injectable()
export class WorkflowVersionStatusListener {
  private readonly logger = new Logger(WorkflowVersionStatusListener.name);

  constructor(
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('workflowVersion.created')
  async handleWorkflowVersionCreated(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    const workflowIds = payload.events
      .filter(
        (event) =>
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
        workspaceId: payload.workspaceId,
        workflowIds,
      },
    );
  }

  @OnEvent('workflowVersion.updated')
  async handleWorkflowVersionUpdated(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    const statusUpdates = payload.events
      .map((event) => {
        return {
          workflowId: event.properties.after.workflowId,
          previousStatus: event.properties.before.status,
          newStatus: event.properties.after.status,
        };
      })
      .filter(
        (workflowVersionEvent) =>
          workflowVersionEvent.previousStatus !==
          workflowVersionEvent.newStatus,
      );

    if (statusUpdates.length === 0) {
      return;
    }

    await this.messageQueueService.add<WorkflowVersionBatchEvent>(
      WorkflowStatusesUpdateJob.name,
      {
        type: WorkflowVersionEventType.STATUS_UPDATE,
        workspaceId: payload.workspaceId,
        statusUpdates,
      },
    );
  }

  @OnEvent('workflowVersion.deleted')
  async handleWorkflowVersionDeleted(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<WorkflowVersionWorkspaceEntity>
    >,
  ): Promise<void> {
    const workflowIds = payload.events
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
        workspaceId: payload.workspaceId,
        workflowIds,
      },
    );
  }
}
