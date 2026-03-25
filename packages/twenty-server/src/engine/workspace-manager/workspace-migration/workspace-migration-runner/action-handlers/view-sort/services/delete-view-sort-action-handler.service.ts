import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import {
  FlatDeleteViewSortAction,
  UniversalDeleteViewSortAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-sort/types/workspace-migration-view-sort-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewSortActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewSort',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteViewSortAction>,
  ): Promise<FlatDeleteViewSortAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewSortAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const viewSortRepository =
      queryRunner.manager.getRepository<ViewSortEntity>(ViewSortEntity);

    await viewSortRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewSortAction>,
  ): Promise<void> {
    return;
  }
}
