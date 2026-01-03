import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type DeleteViewFilterGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter-group/types/workspace-migration-view-filter-group-action-v2.type';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewFilterGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewFilterGroup',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteViewFilterGroupAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { entityId } = action;

    const viewFilterGroupRepository =
      queryRunner.manager.getRepository<ViewFilterGroupEntity>(
        ViewFilterGroupEntity,
      );

    await viewFilterGroupRepository.delete({
      id: entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteViewFilterGroupAction>,
  ): Promise<void> {
    return;
  }
}
