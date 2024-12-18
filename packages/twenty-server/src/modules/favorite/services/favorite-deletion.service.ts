import { In } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { FAVORITE_DELETION_BATCH_SIZE } from 'src/modules/favorite/constants/favorite-deletion-batch-size';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

export class FavoriteDeletionService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async deleteFavoritesForDeletedRecords(
    deletedRecordIds: string[],
  ): Promise<void> {
    const favoriteRepository =
      await this.twentyORMManager.getRepository<FavoriteWorkspaceEntity>(
        'favorite',
      );

    const favoritesToDelete = await favoriteRepository.find({
      select: {
        id: true,
      },
      where: [
        {
          companyId: In(deletedRecordIds),
        },
        {
          personId: In(deletedRecordIds),
        },
        {
          workflowId: In(deletedRecordIds),
        },
        {
          workflowRunId: In(deletedRecordIds),
        },
        {
          workflowVersionId: In(deletedRecordIds),
        },
        {
          viewId: In(deletedRecordIds),
        },
        {
          taskId: In(deletedRecordIds),
        },
        {
          noteId: In(deletedRecordIds),
        },
        {
          custom: {
            id: In(deletedRecordIds),
          },
        },
      ],
    });

    const favoriteIdsToDelete = favoritesToDelete.map(
      (favorite) => favorite.id,
    );

    const batches: string[][] = [];

    for (
      let i = 0;
      i < favoriteIdsToDelete.length;
      i += FAVORITE_DELETION_BATCH_SIZE
    ) {
      batches.push(
        favoriteIdsToDelete.slice(i, i + FAVORITE_DELETION_BATCH_SIZE),
      );
    }

    await Promise.all(batches.map((batch) => favoriteRepository.delete(batch)));
  }
}
