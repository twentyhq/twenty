import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WORKSPACE_TRASH_CLEANUP_CRON_PATTERN } from 'src/engine/workspace-manager/workspace-trash-cleanup/constants/workspace-trash-cleanup.constants';
import { WorkspaceTrashCleanupCronJob } from 'src/engine/workspace-manager/workspace-trash-cleanup/crons/workspace-trash-cleanup.cron.job';

@Command({
  name: 'cron:workspace:cleanup-trash',
  description: 'Starts a cron job to clean up soft-deleted records',
})
export class WorkspaceTrashCleanupCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: WorkspaceTrashCleanupCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: WORKSPACE_TRASH_CLEANUP_CRON_PATTERN,
        },
      },
    });
  }
}
