import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { GmailPartialMessageListFetchCronJob } from 'src/modules/messaging/crons/jobs/gmail-partial-message-list-fetch.cron.job';

const GMAIL_PARTIAL_SYNC_CRON_PATTERN = '*/5 * * * *';

@Command({
  name: 'cron:messaging:gmail-partial-message-list-fetch',
  description:
    'Starts a cron job to sync existing connected account messages and store them in the cache',
})
export class GmailPartialSyncCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      GmailPartialMessageListFetchCronJob.name,
      undefined,
      {
        repeat: { pattern: GMAIL_PARTIAL_SYNC_CRON_PATTERN },
      },
    );
  }
}
