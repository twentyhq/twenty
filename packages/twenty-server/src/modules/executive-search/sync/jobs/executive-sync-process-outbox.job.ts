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
 * In PR3 this job is a stub — the outbox entry is persisted but
 * no external delivery is performed.  PR4 adds the Directus adapter
 * that will handle the actual delivery from this job.
 */
@Processor(MessageQueue.executiveSyncQueue)
export class ExecutiveSyncProcessOutboxJob {
  private readonly logger = new Logger(ExecutiveSyncProcessOutboxJob.name);

  @Process(ExecutiveSyncProcessOutboxJob.name)
  async handle(data: ExecutiveSyncProcessOutboxJobData): Promise<void> {
    this.logger.log(
      `Processing outbox entry ${data.outboxId} for workspace ${data.workspaceId}`,
    );

    // Stub: in PR3 we only persist.  PR4 will invoke the Directus adapter
    // here to deliver the event to the external system.

    // The outbox service already marks entries: we don't need to do anything
    // here in the stub phase except log.
  }
}
