import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { GmailMessagesImportCronJob } from 'src/modules/messaging/crons/jobs/gmail-messages-import.cron.job';

@Command({
  name: 'cron:messaging:gmail-messages-import',
  description: 'Starts a cron job to fetch all messages from cache',
})
export class GmailMessagesImportCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      GmailMessagesImportCronJob.name,
      undefined,
      {
        repeat: {
          every: 5000,
        },
      },
    );
  }
}
