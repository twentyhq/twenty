import { Injectable } from '@nestjs/common';

import { type ObjectRecordDeleteEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type FavoriteFolderWorkspaceEntity } from 'src/modules/favorite-folder/standard-objects/favorite-folder.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Injectable()
export class FavoriteFolderDeletionListener {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @OnDatabaseBatchEvent('favoriteFolder', DatabaseEventAction.DELETED)
  async handleDelete(
    payload: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<FavoriteFolderWorkspaceEntity>
    >,
  ) {
    const workspaceId = payload.workspaceId;
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        for (const eventPayload of payload.events) {
          const favoriteRepository =
            await this.globalWorkspaceOrmManager.getRepository<FavoriteWorkspaceEntity>(
              workspaceId,
              'favorite',
            );

          await favoriteRepository.update(
            { favoriteFolderId: eventPayload.recordId },
            { deletedAt: new Date().toISOString() },
          );
        }
      },
    );
  }
}
