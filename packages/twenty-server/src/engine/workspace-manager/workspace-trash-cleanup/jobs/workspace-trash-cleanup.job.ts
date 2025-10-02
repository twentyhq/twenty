import { Injectable, Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceTrashCleanupService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-cleanup.service';

export type WorkspaceTrashCleanupJobData = {
  workspaceId: string;
  schemaName: string;
  trashRetentionDays: number;
};

@Injectable()
@Processor(MessageQueue.workspaceQueue)
export class WorkspaceTrashCleanupJob {
  private readonly logger = new Logger(WorkspaceTrashCleanupJob.name);

  constructor(
    private readonly workspaceTrashCleanupService: WorkspaceTrashCleanupService,
  ) {}

  @Process(WorkspaceTrashCleanupJob.name)
  async handle(data: WorkspaceTrashCleanupJobData): Promise<void> {
    const { workspaceId, schemaName, trashRetentionDays } = data;

    const result =
      await this.workspaceTrashCleanupService.cleanupWorkspaceTrash({
        workspaceId,
        schemaName,
        trashRetentionDays,
      });

    if (!result.success) {
      this.logger.error(
        `Trash cleanup failed for workspace ${workspaceId}: ${result.error}`,
      );
      throw new Error(result.error);
    }
  }
}
