import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { cleanInactiveWorkspaceCronPattern } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.cron.pattern';
import { CleanInactiveWorkspaceJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.job';

@Command({
  name: 'clean-inactive-workspaces:cron:start',
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
    await this.messageQueueService.addCron<undefined>(
      CleanInactiveWorkspaceJob.name,
      undefined,
      { retryLimit: 3, repeat: { pattern: cleanInactiveWorkspaceCronPattern } },
    );
  }
}
