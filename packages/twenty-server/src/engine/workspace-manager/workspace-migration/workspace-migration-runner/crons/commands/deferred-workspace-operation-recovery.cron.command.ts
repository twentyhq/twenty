import { Command, CommandRunner } from 'nest-commander';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { DEFERRED_WORKSPACE_OPERATION_RECOVERY_CRON_PATTERN } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-recovery-cron-pattern.constant';
import { DeferredWorkspaceOperationRecoveryCronJob } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/crons/jobs/deferred-workspace-operation-recovery.cron.job';

const LEGACY_DEFERRED_WORKSPACE_MIGRATION_ACTION_RECOVERY_CRON_JOB_NAME =
  'DeferredWorkspaceMigrationActionRecoveryCronJob';

@Command({
  name: 'cron:deferred-workspace-operation-recovery',
  description:
    'Starts a cron job to recover stale deferred workspace operations and run pending ones',
})
export class DeferredWorkspaceOperationRecoveryCronCommand extends CommandRunner {
  constructor(
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super();
  }

  async run(): Promise<void> {
    await this.messageQueueService.removeCron({
      jobName:
        LEGACY_DEFERRED_WORKSPACE_MIGRATION_ACTION_RECOVERY_CRON_JOB_NAME,
    });
    await this.messageQueueService.addCron<undefined>({
      jobName: DeferredWorkspaceOperationRecoveryCronJob.name,
      data: undefined,
      options: {
        repeat: {
          pattern: DEFERRED_WORKSPACE_OPERATION_RECOVERY_CRON_PATTERN,
        },
      },
    });
  }
}
