import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { FAVORITE_DELETION_BATCH_SIZE } from 'src/modules/favorite/constants/favorite-deletion-batch-size';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Injectable()
export class FavoriteDeletionService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async deleteFavoritesForDeletedRecords(
    deletedRecordIds: string[],
    workspaceId: string,
  ): Promise<void> {
    const favoriteRepository =
      await this.twentyORMManager.getRepository<FavoriteWorkspaceEntity>(
        'favorite',
      );

    const isWorkflowEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IsWorkflowEnabled,
      workspaceId,
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
        ...(isWorkflowEnabled
          ? [
              {
                workflowId: In(deletedRecordIds),
              },
              {
                workflowRunId: In(deletedRecordIds),
              },
              {
                workflowVersionId: In(deletedRecordIds),
              },
            ]
          : []),
        {
          viewId: In(deletedRecordIds),
        },
        {
          taskId: In(deletedRecordIds),
        },
        {
          noteId: In(deletedRecordIds),
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
