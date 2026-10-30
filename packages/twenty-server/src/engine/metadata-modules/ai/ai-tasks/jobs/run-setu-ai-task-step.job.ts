import { randomUUID } from 'crypto';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SetuAiTaskExecutionService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-execution.service';

export type RunSetuAiTaskStepJobData = {
  taskId: string;
};

// Duplicate jobs are harmless: the ledger lets only one step of a task run
// at a time, and only one worker can claim it.
@Processor(MessageQueue.aiTaskQueue)
export class RunSetuAiTaskStepJob {
  constructor(
    private readonly executionService: SetuAiTaskExecutionService,
    @InjectMessageQueue(MessageQueue.aiTaskQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(RunSetuAiTaskStepJob.name)
  async handle({ taskId }: RunSetuAiTaskStepJobData): Promise<void> {
    const outcome = await this.executionService.runNextStep({
      taskId,
      leaseOwner: `${RunSetuAiTaskStepJob.name}:${process.pid}:${randomUUID()}`,
    });

    if (outcome === 'ran') {
      await this.messageQueueService.add<RunSetuAiTaskStepJobData>(
        RunSetuAiTaskStepJob.name,
        { taskId },
      );
    }
  }
}
