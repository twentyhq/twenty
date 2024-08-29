import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatusesUpdateJob,
  WorkflowVersionEvent,
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
    event: ObjectRecordCreateEvent<WorkflowVersionWorkspaceEntity>,
  ): Promise<void> {
    await this.messageQueueService.add<WorkflowVersionEvent>(
      WorkflowStatusesUpdateJob.name,
      {
        type: WorkflowVersionEventType.CREATE,
        workflowId: event.properties.after.workflowId,
      },
    );
  }

  @OnEvent('workflowVersion.updated')
  async handleWorkflowVersionUpdated(
    event: ObjectRecordUpdateEvent<WorkflowVersionWorkspaceEntity>,
  ): Promise<void> {
    const workflowVersionBefore = event.properties.before;
    const workflowVersionAfter = event.properties.after;

    if (workflowVersionBefore.status === workflowVersionAfter.status) {
      return;
    }

    await this.messageQueueService.add<WorkflowVersionEvent>(
      WorkflowStatusesUpdateJob.name,
      {
        type: WorkflowVersionEventType.STATUS_UPDATE,
        workflowId: workflowVersionAfter.workflowId,
        previousStatus: workflowVersionBefore.status,
        newStatus: workflowVersionAfter.status,
      },
    );
  }

  @OnEvent('workflowVersion.deleted')
  async handleWorkflowVersionDeleted(
    event: ObjectRecordCreateEvent<WorkflowVersionWorkspaceEntity>,
  ): Promise<void> {
    const workflowVersionDeleted = event.properties.after;

    if (workflowVersionDeleted.status !== WorkflowVersionStatus.DRAFT) {
      this.logger.warn(
        `Workflow version ${event.recordId} with status ${workflowVersionDeleted.status} was deleted.`,
      );

      return;
    }

    await this.messageQueueService.add<WorkflowVersionEvent>(
      WorkflowStatusesUpdateJob.name,
      {
        type: WorkflowVersionEventType.DELETE,
        workflowId: workflowVersionDeleted.workflowId,
      },
    );
  }
}
