import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MESSAGING_ONGOING_STALE_CRON_PATTERN,
  MessagingOngoingStaleCronJob,
} from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-ongoing-stale.cron.job';

@Command({
  name: 'cron:messaging:ongoing-stale',
  description:
    'Starts a cron job to check for stale ongoing message imports and put them back to pending',
})
export class MessagingOngoingStaleCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: MessagingOngoingStaleCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: MESSAGING_ONGOING_STALE_CRON_PATTERN },
      },
    });
  }
}
