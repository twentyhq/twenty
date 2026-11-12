import { Injectable, Logger } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { DEFERRED_WORKSPACE_OPERATION_RECOVERY_CRON_PATTERN } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-recovery-cron-pattern.constant';
import { DeferredWorkspaceOperationRecoveryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-recovery.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class DeferredWorkspaceOperationRecoveryCronJob {
  private readonly logger = new Logger(
    DeferredWorkspaceOperationRecoveryCronJob.name,
  );

  constructor(
    private readonly deferredWorkspaceOperationRecoveryService: DeferredWorkspaceOperationRecoveryService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(DeferredWorkspaceOperationRecoveryCronJob.name)
  @SentryCronMonitor(
    DeferredWorkspaceOperationRecoveryCronJob.name,
    DEFERRED_WORKSPACE_OPERATION_RECOVERY_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    try {
      const resetOperationCount =
        await this.deferredWorkspaceOperationRecoveryService.resetStaleInProgressOperations();

      const enqueuedWorkspaceCount =
        await this.deferredWorkspaceOperationRecoveryService.enqueueWorkspacesWithPendingOperations();

      if (resetOperationCount > 0 || enqueuedWorkspaceCount > 0) {
        this.logger.log(
          `Reset ${resetOperationCount} stale in-progress deferred operation(s), enqueued ${enqueuedWorkspaceCount} workspace(s) with pending operations`,
        );
      }
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error]);
      throw error;
    }
  }
}
