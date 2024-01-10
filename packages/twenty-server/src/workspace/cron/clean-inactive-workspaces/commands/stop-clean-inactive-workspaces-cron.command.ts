import { Inject } from '@nestjs/common';

import { Command, CommandRunner } from 'nest-commander';

import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { cleanInactiveWorkspaceCronPattern } from 'src/workspace/cron/clean-inactive-workspaces/commands/utils/cron-pattern';

@Command({
  name: 'clean-inactive-workspace:cron:stop',
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
    await this.messageQueueService.unschedule(
      StopCleanInactiveWorkspacesCronCommand.name,
      cleanInactiveWorkspaceCronPattern,
    );
  }
}
