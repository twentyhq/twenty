import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { isDefined } from 'twenty-shared/utils';

import { type QueueJobRecipient } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type QueueJobDetails } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type MessageQueueJobData } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

import { QUEUE_JOB_CHANGED_EVENT } from 'src/engine/core-modules/message-queue/constants/queue-job-changed-event.constant';
import { bullMQToJobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';
import { type QueueJobChangedEvent } from 'src/engine/core-modules/message-queue/types/queue-job-changed-event.type';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

@Injectable()
export class QueueJobEventListener {
  private readonly logger = new Logger(QueueJobEventListener.name);
  private publishChain = Promise.resolve();

  constructor(
    private readonly workspaceEventBroadcaster: WorkspaceEventBroadcaster,
  ) {}

  @OnEvent(QUEUE_JOB_CHANGED_EVENT)
  handleJobChanged({ job }: QueueJobChangedEvent): void {
    const { broadcastTo } = job;

    if (!isDefined(broadcastTo)) {
      return;
    }

    this.publishChain = this.publishChain.then(() =>
      this.publish({ job, broadcastTo }),
    );
  }

  private async publish({
    job,
    broadcastTo: { workspaceId, userWorkspaceId },
  }: {
    job: QueueJobDetails<MessageQueueJobData>;
    broadcastTo: QueueJobRecipient;
  }): Promise<void> {
    try {
      await this.workspaceEventBroadcaster.broadcastQueueJobEvent({
        workspaceId,
        userWorkspaceId,
        queueJobEvent: {
          jobId: job.id,
          state: bullMQToJobStateEnum[job.state],
          attemptsMade: job.attemptsMade,
          failedReason: job.failedReason,
          enqueuedAt: job.timestamp,
          startedAt: job.processedOn,
          finishedAt: job.finishedOn,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to broadcast ${job.state} status of job ${job.id} in workspace ${workspaceId}`,
        error,
      );
    }
  }
}
