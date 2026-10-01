import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_RECOVERY_CRON_PATTERN } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-recovery-cron-pattern.constant';
import { DeferredWorkspaceMigrationActionRecoveryCronJob } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/crons/jobs/deferred-workspace-migration-action-recovery.cron.job';

@Command({
  name: 'cron:deferred-workspace-migration-action-recovery',
  description:
    'Starts a cron job to recover stale deferred workspace migration actions and run pending ones',
})
export class DeferredWorkspaceMigrationActionRecoveryCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.addCron<undefined>({
      jobName: DeferredWorkspaceMigrationActionRecoveryCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: DEFERRED_WORKSPACE_MIGRATION_ACTION_RECOVERY_CRON_PATTERN,
        },
      },
    });
  }
}
