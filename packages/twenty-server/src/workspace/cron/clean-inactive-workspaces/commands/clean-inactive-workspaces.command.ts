import { Inject } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { CleanInactiveWorkspaceJob } from 'src/workspace/cron/clean-inactive-workspaces/clean-inactive-workspace.job';

export type CleanInactiveWorkspacesCommandOptions = {
  dryRun: boolean;
};

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

  @Option({
    flags: '-d, --dry-run [dry run]',
    description: 'Dry run: Log cleaning actions without executing them.',
    required: false,
  })
  dryRun(value: string): boolean {
    return Boolean(value);
  }

  async run(
    _passedParam: string[],
    options: CleanInactiveWorkspacesCommandOptions,
  ): Promise<void> {
    await this.messageQueueService.add<CleanInactiveWorkspacesCommandOptions>(
      CleanInactiveWorkspaceJob.name,
      options,
      { retryLimit: 3 },
    );
  }
}
