import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { CleanInactiveWorkspaceJob } from 'src/workspace/cron/jobs/clean-inactive-workspace.job';

@Command({
  name: 'clean-inactive-workspace:cron:start',
  description: 'Starts a cron job to clean inactive workspaces',
})
export class StartCleanInactiveWorkspacesCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.schedule<undefined>(
      CleanInactiveWorkspaceJob.name,
      undefined,
      '* * * * *',
      { retryLimit: 3 },
    );
  }
}
