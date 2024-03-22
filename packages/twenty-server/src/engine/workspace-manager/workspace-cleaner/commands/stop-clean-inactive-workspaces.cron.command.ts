import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { cleanInactiveWorkspaceCronPattern } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.cron.pattern';
import { CleanInactiveWorkspaceJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-inactive-workspace.job';

@Command({
  name: 'clean-inactive-workspaces:cron:stop',
  description: 'Stops the clean inactive workspaces cron job',
})
export class StopCleanInactiveWorkspacesCronCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.removeCron(
      CleanInactiveWorkspaceJob.name,
      cleanInactiveWorkspaceCronPattern,
    );
  }
}
