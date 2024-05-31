import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { GmailMessageListFetchCronJob } from 'src/modules/messaging/crons/jobs/gmail-message-list-fetch.cron.job';

const GMAIL_MESSAGE_LIST_FETCH_CRON_PATTERN = '*/5 * * * *';

@Command({
  name: 'cron:messaging:gmail-message-list-fetch',
  description:
    'Starts a cron job to sync existing connected account messages and store them in the cache',
})
export class GmailMessageListFetchCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      GmailMessageListFetchCronJob.name,
      undefined,
      {
        repeat: { pattern: GMAIL_MESSAGE_LIST_FETCH_CRON_PATTERN },
      },
    );
  }
}
