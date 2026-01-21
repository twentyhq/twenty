import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { DeleteViewFilterAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter/types/workspace-migration-view-filter-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewFilterActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewFilter',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteViewFilterAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { entityId } = action;

    const viewFilterRepository =
      queryRunner.manager.getRepository<ViewFilterEntity>(ViewFilterEntity);

    await viewFilterRepository.delete({
      id: entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteViewFilterAction>,
  ): Promise<void> {
    return;
  }
}
