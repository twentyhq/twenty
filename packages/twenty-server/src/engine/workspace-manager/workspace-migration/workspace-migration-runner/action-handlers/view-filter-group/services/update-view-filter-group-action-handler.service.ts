import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type FlatUpdateViewFilterGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-filter-group/types/workspace-migration-view-filter-group-action.type';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateViewFilterGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'viewFilterGroup',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateViewFilterGroupAction>,
  ): Promise<FlatUpdateViewFilterGroupAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewFilterGroupAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const viewFilterGroupRepository =
      queryRunner.manager.getRepository<ViewFilterGroupEntity>(
        ViewFilterGroupEntity,
      );

    await viewFilterGroupRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewFilterGroupAction>,
  ): Promise<void> {
    return;
  }
}
