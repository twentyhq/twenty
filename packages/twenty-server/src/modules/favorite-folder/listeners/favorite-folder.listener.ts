import { Injectable } from '@nestjs/common';

import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { FavoriteFolderWorkspaceEntity } from 'src/modules/favorite-folder/standard-objects/favorite-folder.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class FavoriteFolderDeletionListener {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @OnDatabaseBatchEvent('favoriteFolder', DatabaseEventAction.DELETED)
  async handleDelete(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<FavoriteFolderWorkspaceEntity>
    >,
  ) {
    const isFavoriteFolderEntityEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsFavoriteFolderEntityEnabled,
        payload.workspaceId,
      );

    if (!isFavoriteFolderEntityEnabled) {
      return;
    }

    for (const eventPayload of payload.events) {
      const favoriteRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
          payload.workspaceId,
          'favorite',
        );

      await favoriteRepository.update(
        { favoriteFolderId: eventPayload.recordId },
        { deletedAt: new Date().toISOString() },
      );
    }
  }
}
