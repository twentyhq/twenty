import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SETU_AI_TASK_DISPATCHER_CRON_PATTERN } from 'src/engine/metadata-modules/ai/ai-tasks/constants/setu-ai-task-dispatcher-cron-pattern.constant';
import { SetuAiTaskDispatcherCronJob } from 'src/engine/metadata-modules/ai/ai-tasks/crons/jobs/setu-ai-task-dispatcher.cron.job';

@Command({
  name: 'cron:setu-ai-tasks:dispatch',
  description:
    'Starts a cron job that enqueues runnable AI research tasks and recovers steps abandoned by a worker',
})
export class SetuAiTaskDispatcherCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: SetuAiTaskDispatcherCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: SETU_AI_TASK_DISPATCHER_CRON_PATTERN },
      },
    });
  }
}
