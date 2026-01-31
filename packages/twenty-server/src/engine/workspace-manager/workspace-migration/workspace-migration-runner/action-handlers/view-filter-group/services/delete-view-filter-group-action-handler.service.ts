import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type FlatDeleteViewFilterGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/types/workspace-migration-view-filter-group-action.type';
import { type WorkspaceMigrationActionRunnerContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewFilterGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewFilterGroup',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewFilterGroupAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const viewFilterGroupRepository =
      queryRunner.manager.getRepository<ViewFilterGroupEntity>(
        ViewFilterGroupEntity,
      );

    await viewFilterGroupRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewFilterGroupAction>,
  ): Promise<void> {
    return;
  }
}
