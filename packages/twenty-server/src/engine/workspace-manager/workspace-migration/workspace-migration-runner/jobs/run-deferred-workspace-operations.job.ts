import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { RUN_DEFERRED_WORKSPACE_OPERATIONS_JOB_NAME } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/run-deferred-workspace-operations-job-name.constant';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

export type RunDeferredWorkspaceOperationsJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.workspaceQueue)
export class RunDeferredWorkspaceOperationsJob {
  constructor(
    private readonly deferredWorkspaceOperationRunnerService: DeferredWorkspaceOperationRunnerService,
  ) {}

  @Process(RUN_DEFERRED_WORKSPACE_OPERATIONS_JOB_NAME)
  async handle(data: RunDeferredWorkspaceOperationsJobData): Promise<void> {
    await this.deferredWorkspaceOperationRunnerService.runPendingOperations(
      data.workspaceId,
    );
  }
}
