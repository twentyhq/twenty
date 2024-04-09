import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { fetchAllWorkspacesMessagesCronPattern } from 'src/modules/messaging/commands/crons/patterns/fetch-all-workspaces-messages.cron.pattern';
import { GmailPartialSyncCronJob } from 'src/modules/messaging/jobs/crons/gmail-partial-sync.cron.job';

@Command({
  name: 'cron:messaging:gmail-partial-sync',
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
      GmailPartialSyncCronJob.name,
      undefined,
      {
        repeat: { pattern: fetchAllWorkspacesMessagesCronPattern },
      },
    );
  }
}
