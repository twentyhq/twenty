import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_RECOVERY_CRON_PATTERN } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-recovery-cron-pattern.constant';
import { DeferredWorkspaceMigrationActionRecoveryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-migration-action-recovery.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class DeferredWorkspaceMigrationActionRecoveryCronJob {
  private readonly logger = new Logger(
    DeferredWorkspaceMigrationActionRecoveryCronJob.name,
  );

  constructor(
    private readonly deferredWorkspaceMigrationActionRecoveryService: DeferredWorkspaceMigrationActionRecoveryService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(DeferredWorkspaceMigrationActionRecoveryCronJob.name)
  @SentryCronMonitor(
    DeferredWorkspaceMigrationActionRecoveryCronJob.name,
    DEFERRED_WORKSPACE_MIGRATION_ACTION_RECOVERY_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    try {
      const resetActionCount =
        await this.deferredWorkspaceMigrationActionRecoveryService.resetStaleInProgressActions();

      const enqueuedWorkspaceCount =
        await this.deferredWorkspaceMigrationActionRecoveryService.enqueueWorkspacesWithPendingActions();

      if (resetActionCount > 0 || enqueuedWorkspaceCount > 0) {
        this.logger.log(
          `Reset ${resetActionCount} stale in-progress deferred action(s), enqueued ${enqueuedWorkspaceCount} workspace(s) with pending actions`,
        );
      }
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error]);
      throw error;
    }
  }
}
