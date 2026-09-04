import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { type QueueJobDetails } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { bullMQToJobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

@Injectable()
export class QueueJobStatusBroadcaster {
  private readonly logger = new Logger(QueueJobStatusBroadcaster.name);

  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  async broadcast(job: QueueJobDetails<MessageQueueJobData>): Promise<void> {
    const { workspaceId, userWorkspaceId } = job.data;

    if (!isNonEmptyString(workspaceId) || !isNonEmptyString(userWorkspaceId)) {
      return;
    }

    try {
      await this.workspaceEventBroadcaster.broadcast({
        workspaceId,
        events: [
          {
            type: 'updated',
            entityName: 'queueJob',
            recordId: job.id,
            recipientUserWorkspaceIds: [userWorkspaceId],
            properties: {
              after: {
                jobId: job.id,
                state: bullMQToJobStateEnum[job.state],
                attemptsMade: job.attemptsMade,
                failedReason: job.failedReason ?? null,
                enqueuedAt: job.timestamp,
                startedAt: job.processedOn ?? null,
                finishedAt: job.finishedOn ?? null,
              },
            },
          },
        ],
      });
    } catch (error) {
      this.logger.warn(
        `Failed to broadcast ${job.state} status of job ${job.id} in workspace ${workspaceId}`,
        error,
      );
    }
  }
}
