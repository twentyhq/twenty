import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { cleanInactiveWorkspaceCronPattern } from 'src/workspace/cron/clean-inactive-workspaces/clean-inactive-workspace.cron.pattern';
import { CleanInactiveWorkspaceJob } from 'src/workspace/cron/clean-inactive-workspaces/clean-inactive-workspace.job';

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
