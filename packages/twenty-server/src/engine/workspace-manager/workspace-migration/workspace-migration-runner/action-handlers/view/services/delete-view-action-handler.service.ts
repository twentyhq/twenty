import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { FlatDeleteViewAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/types/workspace-migration-view-action.type';
import { WorkspaceMigrationActionRunnerContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'view',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const viewRepository =
      queryRunner.manager.getRepository<ViewEntity>(ViewEntity);

    await viewRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewAction>,
  ): Promise<void> {
    return;
  }
}
