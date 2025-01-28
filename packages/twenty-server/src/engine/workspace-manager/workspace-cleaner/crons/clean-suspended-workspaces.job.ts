import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CleanWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/clean.workspace-service';

@Processor(MessageQueue.cronQueue)
export class CleanSuspendedWorkspacesJob {
  constructor(private readonly cleanWorkspaceService: CleanWorkspaceService) {}

  @Process(CleanSuspendedWorkspacesJob.name)
  async handle(): Promise<void> {
    await this.cleanWorkspaceService.batchWarnOrCleanWorkspaces();
  }
}
