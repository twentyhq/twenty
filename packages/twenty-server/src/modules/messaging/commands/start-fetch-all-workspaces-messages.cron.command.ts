import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { fetchAllWorkspacesMessagesCronPattern } from 'src/modules/messaging/commands/crons/fetch-all-workspaces-messages.cron.pattern';
import { FetchAllWorkspacesMessagesJob } from 'src/modules/messaging/commands/crons/fetch-all-workspaces-messages.job';

@Command({
  name: 'fetch-all-workspaces-messages:cron:start',
  description: 'Starts a cron job to fetch all workspaces messages',
})
export class StartFetchAllWorkspacesMessagesCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>(
      FetchAllWorkspacesMessagesJob.name,
      undefined,
      {
        repeat: { pattern: fetchAllWorkspacesMessagesCronPattern },
      },
    );
  }
}
