import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewTabEntity } from 'src/engine/metadata-modules/view-tab/entities/view-tab.entity';
import {
  FlatDeleteViewTabAction,
  UniversalDeleteViewTabAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-tab/types/workspace-migration-view-tab-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewTabActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewTab',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteViewTabAction>,
  ): Promise<FlatDeleteViewTabAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewTabAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const viewTabRepository =
      queryRunner.manager.getRepository<ViewTabEntity>(ViewTabEntity);

    await viewTabRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewTabAction>,
  ): Promise<void> {
    return;
  }
}
