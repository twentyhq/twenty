import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ShahryarNotificationDispatchCronJob } from 'src/modules/shahryar/crons/jobs/shahryar-notification-dispatch.cron.job';
import { SHAHRYAR_NOTIFICATION_DISPATCH_CRON_PATTERN } from 'src/modules/shahryar/crons/shahryar-notification-dispatch.cron.pattern';

@Command({
  name: 'cron:shahryar:notification-dispatch',
  description:
    'Starts the daily Shahryar mobile notification dispatch cron job',
})
export class ShahryarNotificationDispatchCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: ShahryarNotificationDispatchCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: SHAHRYAR_NOTIFICATION_DISPATCH_CRON_PATTERN },
      },
    });
  }
}
