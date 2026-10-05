import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import {
  StopDeletedWorkflowRunsJob,
  type StopDeletedWorkflowRunsJobData,
} from 'src/modules/workflow/workflow-runner/jobs/stop-deleted-workflow-runs.job';
import { getDeletedInstalledApplicationWorkflowIds } from 'src/modules/workflow/workflow-runner/utils/get-deleted-installed-application-workflow-ids.util';

@Injectable()
export class ApplicationWorkflowDeletionListener {
  constructor(
    private readonly applicationService: ApplicationService,
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('metadata.workflow.deleted')
  async handleDeleted(
    metadataEventBatch: MetadataEventBatch<'workflow', 'deleted'>,
  ): Promise<void> {
    const { workspaceId } = metadataEventBatch;

    const { workspaceCustomFlatApplication, twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const coreWorkflowIds = getDeletedInstalledApplicationWorkflowIds({
      events: metadataEventBatch.events,
      workspaceOwnedApplicationIds: [
        workspaceCustomFlatApplication.id,
        twentyStandardFlatApplication.id,
      ],
    });

    if (coreWorkflowIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<StopDeletedWorkflowRunsJobData>(
      StopDeletedWorkflowRunsJob.name,
      { workspaceId, coreWorkflowIds },
      { retryLimit: 3 },
    );
  }
}
