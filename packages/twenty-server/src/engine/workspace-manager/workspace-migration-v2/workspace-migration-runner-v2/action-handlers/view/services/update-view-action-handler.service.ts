import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { UpdateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateViewActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_view',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateViewAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { viewId, updates } = action;

    const viewRepository =
      queryRunner.manager.getRepository<ViewEntity>(ViewEntity);

    const updatesToSave = updates.reduce((acc, { to, property }) => {
      return {
        ...acc,
        [property]: to,
      };
    }, {});

    await viewRepository.save({
      id: viewId,
      ...updatesToSave,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewAction>,
  ): Promise<void> {
    return;
  }
}
