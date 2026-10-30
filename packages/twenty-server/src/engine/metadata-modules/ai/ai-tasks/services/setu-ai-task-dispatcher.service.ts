import { Injectable, Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  RunSetuAiTaskStepJob,
  type RunSetuAiTaskStepJobData,
} from 'src/engine/metadata-modules/ai/ai-tasks/jobs/run-setu-ai-task-step.job';
import { SetuAiTaskLedgerService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-ledger.service';

const DISPATCH_BATCH_SIZE = 100;

// Queued steps are the durable intent; Redis only carries a pointer to the
// task. This repairs whatever a lost enqueue or a dead worker left behind.
@Injectable()
export class SetuAiTaskDispatcherService {
  private readonly logger = new Logger(SetuAiTaskDispatcherService.name);

  constructor(
    private readonly ledgerService: SetuAiTaskLedgerService,
    @InjectMessageQueue(MessageQueue.aiTaskQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueue(taskId: string): Promise<void> {
    await this.messageQueueService.add<RunSetuAiTaskStepJobData>(
      RunSetuAiTaskStepJob.name,
      { taskId },
    );
  }

  async dispatch(): Promise<void> {
    const abandonedSteps =
      await this.ledgerService.findStepsWithExpiredLease(DISPATCH_BATCH_SIZE);

    for (const step of abandonedSteps) {
      await this.ledgerService
        .resolveAbandonedStep(step)
        .catch((error) =>
          this.logger.error(
            `Could not resolve task step ${step.id}: ${error instanceof Error ? error.name : 'error'}`,
          ),
        );
    }

    const runnable =
      await this.ledgerService.findRunnableTaskIds(DISPATCH_BATCH_SIZE);

    for (const { id } of runnable) {
      await this.enqueue(id);
    }

    if (abandonedSteps.length > 0 || runnable.length > 0) {
      this.logger.log(
        `Resolved ${abandonedSteps.length} abandoned task steps, enqueued ${runnable.length} tasks`,
      );
    }
  }
}
