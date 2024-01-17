import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { CleanInactiveWorkspaceJob } from 'src/workspace/cron/clean-inactive-workspaces/clean-inactive-workspace.job';

@Command({
  name: 'clean-inactive-workspaces',
  description: 'Clean inactive workspaces',
})
export class CleanInactiveWorkspacesCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.taskAssignedQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.add<any>(
      CleanInactiveWorkspaceJob.name,
      {},
      { retryLimit: 3 },
    );
  }
}
