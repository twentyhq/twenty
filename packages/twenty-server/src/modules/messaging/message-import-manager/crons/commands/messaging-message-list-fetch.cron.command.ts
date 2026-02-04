import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  MESSAGING_MESSAGE_LIST_FETCH_CRON_PATTERN,
  MessagingMessageListFetchCronJob,
} from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-message-list-fetch.cron.job';

@Command({
  name: 'cron:messaging:message-list-fetch',
  description:
    'Starts a cron job to sync existing connected account messages and store them in the cache',
})
export class MessagingMessageListFetchCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: MessagingMessageListFetchCronJob.name,
      data: undefined,
      options: {
        repeat: { pattern: MESSAGING_MESSAGE_LIST_FETCH_CRON_PATTERN },
      },
    });
  }
}
