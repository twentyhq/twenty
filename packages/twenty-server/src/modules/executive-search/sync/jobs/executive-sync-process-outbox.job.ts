import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueJob } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { OutboundProjectionService } from 'src/modules/executive-search/outbound/services/outbound-projection.service';

export type ExecutiveSyncProcessOutboxJobData = {
  workspaceId: string;
  outboxId: string;
};

/**
 * Processes a single outbox entry asynchronously.
 *
 * Dispatches to OutboundProjectionService for delivery of outbox events
 * to the external Directus system.  Errors are handled internally by the
 * projection service (markSent/markFailed) — this job does NOT rethrow
 * so BullMQ's own retry mechanism does not interfere with the outbox's
 * own retry/backoff schedule.
 */
@Processor(MessageQueue.executiveSyncQueue)
export class ExecutiveSyncProcessOutboxJob {
  private readonly logger = new Logger(ExecutiveSyncProcessOutboxJob.name);

  constructor(
    private readonly projectionService: OutboundProjectionService,
  ) {}

  @Process(ExecutiveSyncProcessOutboxJob.name)
  async handle(data: ExecutiveSyncProcessOutboxJobData): Promise<void> {
    this.logger.log(
      `Processing outbox entry ${data.outboxId} for workspace ${data.workspaceId}`,
    );

    try {
      await this.projectionService.deliver(data.workspaceId, data.outboxId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Unhandled error in outbox job for ${data.outboxId} in workspace ${data.workspaceId}: ${message}`,
      );
      // Do NOT rethrow — deliver() already called markFailed and manages
      // its own retry schedule.  Rethrowing would trigger BullMQ retries
      // outside the outbox's backoff schedule.
    }
  }
}
