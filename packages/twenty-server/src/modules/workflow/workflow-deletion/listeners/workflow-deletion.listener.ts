import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import {
  CleanUpDeletedWorkflowsJob,
  type CleanUpDeletedWorkflowsJobData,
} from 'src/modules/workflow/workflow-deletion/jobs/clean-up-deleted-workflows.job';

@Injectable()
export class WorkflowDeletionListener {
  constructor(
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('metadata.workflow.deleted')
  async handleDeleted(
    metadataEventBatch: MetadataEventBatch<'workflow', 'deleted'>,
  ): Promise<void> {
    const coreWorkflowIds = metadataEventBatch.events.map(
      ({ recordId }) => recordId,
    );

    if (coreWorkflowIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<CleanUpDeletedWorkflowsJobData>(
      CleanUpDeletedWorkflowsJob.name,
      { workspaceId: metadataEventBatch.workspaceId, coreWorkflowIds },
      { retryLimit: 3 },
    );
  }
}
