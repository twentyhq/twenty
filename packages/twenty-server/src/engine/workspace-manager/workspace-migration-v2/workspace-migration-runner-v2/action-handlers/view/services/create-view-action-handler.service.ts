import { Injectable } from '@nestjs/common';

import { QueryRunner } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { View } from 'src/engine/core-modules/view/entities/view.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CreateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Injectable()
export class CreateViewActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_view',
) {
  constructor(private readonly twentyORMGlobalManager: TwentyORMGlobalManager) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateViewAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { view } = action;

    const viewRepository = queryRunner.manager.getRepository<View>(View);

    await viewRepository.save({
      ...view,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<CreateViewAction>,
  ): Promise<void> {
    const { action, workspaceQueryRunner } = context;
    const { view } = action;

    await this.createWorkspaceFavorite(view.id, workspaceQueryRunner);
  }

  private async createWorkspaceFavorite(
    viewId: string,
    workspaceQueryRunner: QueryRunner,
  ): Promise<void> {
    const favoriteRepository =
      workspaceQueryRunner.manager.getRepository<FavoriteWorkspaceEntity>(
        'favorite',
      );

    const favoriteCount = await favoriteRepository.count();

    await favoriteRepository.insert({
      viewId,
      position: favoriteCount,
    });
  }
}
