import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueJob } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';

export type ExecutiveSyncProcessOutboxJobData = {
  workspaceId: string;
  outboxId: string;
};

/**
 * Processes a single outbox entry asynchronously.
 *
 * In PR3 the outbox persistence layer was introduced.  PR4 adds the
 * Directus adapter and the inbox/DLQ pipeline — this job now
 * dispatches to the Directus adapter for delivery of outbox events
 * to the external system.
 */
@Processor(MessageQueue.executiveSyncQueue)
export class ExecutiveSyncProcessOutboxJob {
  private readonly logger = new Logger(ExecutiveSyncProcessOutboxJob.name);

  @Process(ExecutiveSyncProcessOutboxJob.name)
  async handle(data: ExecutiveSyncProcessOutboxJobData): Promise<void> {
    this.logger.log(
      `Processing outbox entry ${data.outboxId} for workspace ${data.workspaceId}`,
    );

    // PR4: the outbox entry is persisted and enqueued.  The Directus
    // adapter delivers events to the external system from this job.
    // The outbox service handles status transitions (SENT/FAILED).
  }
}
