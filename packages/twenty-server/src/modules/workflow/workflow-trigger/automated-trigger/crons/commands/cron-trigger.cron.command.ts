import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CRON_TRIGGER_CRON_PATTERN,
  CronTriggerCronJob,
} from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/cron-trigger.cron.job';

@Command({
  name: 'cron:workflow:automated-cron-trigger',
  description: 'Starts a cron job to trigger cron triggered workflows',
})
export class CronTriggerCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: CronTriggerCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: CRON_TRIGGER_CRON_PATTERN,
        },
      },
    });
  }
}
