import { Injectable, Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TrashCleanupService } from 'src/engine/trash-cleanup/services/trash-cleanup.service';

export type TrashCleanupJobData = {
  workspaceId: string;
  trashRetentionDays: number;
};

@Injectable()
@Processor(MessageQueue.workspaceQueue)
export class TrashCleanupJob {
  private readonly logger = new Logger(TrashCleanupJob.name);

  constructor(private readonly trashCleanupService: TrashCleanupService) {}

  @Process(TrashCleanupJob.name)
  async handle(data: TrashCleanupJobData): Promise<void> {
    const { workspaceId, trashRetentionDays } = data;

    try {
      await this.trashCleanupService.cleanupWorkspaceTrash({
        workspaceId,
        trashRetentionDays,
      });
    } catch (error) {
      this.logger.error(
        `Trash cleanup failed for workspace ${workspaceId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
