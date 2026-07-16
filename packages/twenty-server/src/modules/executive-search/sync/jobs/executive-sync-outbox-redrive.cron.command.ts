import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { EXECUTIVE_SYNC_OUTBOX_REDRIVE_CRON_PATTERN } from 'src/modules/executive-search/sync/jobs/executive-sync-outbox-redrive.cron.pattern';
import { EXECUTIVE_SYNC_OUTBOX_REDRIVE_JOB_NAME } from 'src/modules/executive-search/sync/jobs/executive-sync-outbox-redrive.job';

@Command({
  name: 'cron:executive-search:redrive-outbox',
  description: 'Starts a cron job to redrive outbox entries',
})
export class ExecutiveSearchOutboxRedriveCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: EXECUTIVE_SYNC_OUTBOX_REDRIVE_JOB_NAME,
      data: undefined,
      options: {
        repeat: { pattern: EXECUTIVE_SYNC_OUTBOX_REDRIVE_CRON_PATTERN },
      },
    });
  }
}
