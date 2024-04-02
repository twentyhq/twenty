import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { FetchAllMessagesFromCacheCronJob } from 'src/modules/messaging/commands/crons/fetch-all-messages-from-cache.cron-job';

@Command({
  name: 'fetch-all-workspaces-messages-from-cache:cron:start',
  description: 'Starts a cron job to fetch all workspaces messages from cache',
})
export class StartFetchAllWorkspacesMessagesFromCacheCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      FetchAllMessagesFromCacheCronJob.name,
      undefined,
      {
        repeat: {
          every: 5000,
        },
      },
    );
  }
}
