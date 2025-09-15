import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { DeleteViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_view',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteViewAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { viewId } = action;

    const viewRepository =
      queryRunner.manager.getRepository<ViewEntity>(ViewEntity);

    await viewRepository.delete({
      id: viewId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteViewAction>,
  ): Promise<void> {
    return;
  }
}
