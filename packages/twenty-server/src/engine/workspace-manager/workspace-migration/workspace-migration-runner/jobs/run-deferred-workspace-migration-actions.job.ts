import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RUN_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_JOB_NAME } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/run-deferred-workspace-migration-actions-job-name.constant';
import { DeferredWorkspaceMigrationActionRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-migration-action-runner.service';

export type RunDeferredWorkspaceMigrationActionsJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.workspaceQueue)
export class RunDeferredWorkspaceMigrationActionsJob {
  constructor(
    private readonly deferredWorkspaceMigrationActionRunnerService: DeferredWorkspaceMigrationActionRunnerService,
  ) {}

  @Process(RUN_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_JOB_NAME)
  async handle(
    data: RunDeferredWorkspaceMigrationActionsJobData,
  ): Promise<void> {
    await this.deferredWorkspaceMigrationActionRunnerService.runPendingActions(
      data.workspaceId,
    );
  }
}
