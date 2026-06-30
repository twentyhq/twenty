import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TRASH_CLEANUP_CRON_PATTERN } from 'src/engine/trash-cleanup/constants/trash-cleanup-cron-pattern.constant';
import { TrashCleanupCronJob } from 'src/engine/trash-cleanup/crons/trash-cleanup.cron.job';

@Command({
  name: 'cron:trash-cleanup',
  description: 'Starts a cron job to clean up soft-deleted records',
})
export class TrashCleanupCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: TrashCleanupCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: TRASH_CLEANUP_CRON_PATTERN,
        },
      },
    });
  }
}
