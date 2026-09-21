import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { DeferredWorkspaceMigrationActionRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-migration-action-runner.service';

export type RunDeferredWorkspaceMigrationActionsJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.workspaceQueue)
export class RunDeferredWorkspaceMigrationActionsJob {
  constructor(
    private readonly deferredWorkspaceMigrationActionRunnerService: DeferredWorkspaceMigrationActionRunnerService,
  ) {}

  @Process(RunDeferredWorkspaceMigrationActionsJob.name)
  async handle(
    data: RunDeferredWorkspaceMigrationActionsJobData,
  ): Promise<void> {
    await this.deferredWorkspaceMigrationActionRunnerService.runPendingActions(
      data.workspaceId,
    );
  }
}
