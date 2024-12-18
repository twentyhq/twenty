import { Injectable } from '@nestjs/common';

import { OnCustomBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-custom-batch-event.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { FAVORITE_DELETION_BATCH_SIZE } from 'src/modules/favorite/constants/favorite-deletion-batch-size';
import {
  FavoriteDeletionJob,
  FavoriteDeletionJobData,
} from 'src/modules/favorite/jobs/favorite-deletion.job';

@Injectable()
export class MessagingMessageCleanerConnectedAccountListener {
  constructor(
    @InjectMessageQueue(MessageQueue.favoriteQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnCustomBatchEvent('favorites_deleted')
  async handleDeletedEvent(
    payload: WorkspaceEventBatch<FavoriteDeletionJobData>,
  ) {
    payload.events.map(({ favoriteIds }) => {
      const batches: string[][] = [];

      for (
        let i = 0;
        i < favoriteIds.length;
        i += FAVORITE_DELETION_BATCH_SIZE
      ) {
        batches.push(favoriteIds.slice(i, i + FAVORITE_DELETION_BATCH_SIZE));
      }

      batches.map((batch) =>
        this.messageQueueService.add<FavoriteDeletionJobData>(
          FavoriteDeletionJob.name,
          {
            favoriteIds: batch,
          },
        ),
      );
    });
  }
}
