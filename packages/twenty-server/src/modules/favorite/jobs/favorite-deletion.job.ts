import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { FavoriteDeletionService } from 'src/modules/favorite/services/favorite-deletion.service';

export type FavoriteDeletionJobData = {
  workspaceId: string;
  deletedRecordIds: string[];
};

@Processor({
  queueName: MessageQueue.deleteCascadeQueue,
  scope: Scope.REQUEST,
})
export class FavoriteDeletionJob {
  constructor(
    private readonly favoriteDeletionService: FavoriteDeletionService,
  ) {}

  @Process(FavoriteDeletionJob.name)
  async handle(data: FavoriteDeletionJobData): Promise<void> {
    await this.favoriteDeletionService.deleteFavoritesForDeletedRecords(
      data.deletedRecordIds,
      data.workspaceId,
    );
  }
}
