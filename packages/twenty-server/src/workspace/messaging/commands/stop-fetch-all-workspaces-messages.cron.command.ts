import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { fetchAllWorkspacesMessagesCronPattern } from 'src/workspace/messaging/commands/crons/fetch-all-workspaces-messages.cron.pattern';
import { FetchAllWorkspacesMessagesJob } from 'src/workspace/messaging/commands/crons/fetch-all-workspaces-messages.job';

@Command({
  name: 'fetch-all-workspaces-messages:cron:stop',
  description: 'Stops the fetch all workspaces messages cron job',
})
export class StopFetchAllWorkspacesMessagesCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.removeCron(
      FetchAllWorkspacesMessagesJob.name,
      fetchAllWorkspacesMessagesCronPattern,
    );
  }
}
