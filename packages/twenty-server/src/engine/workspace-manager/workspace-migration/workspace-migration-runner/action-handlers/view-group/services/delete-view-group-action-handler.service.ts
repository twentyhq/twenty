import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import {
  FlatDeleteViewGroupAction,
  UniversalDeleteViewGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/types/workspace-migration-view-group-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewGroup',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteViewGroupAction>,
  ): Promise<FlatDeleteViewGroupAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewGroupAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const viewGroupRepository =
      queryRunner.manager.getRepository<ViewGroupEntity>(ViewGroupEntity);

    await viewGroupRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewGroupAction>,
  ): Promise<void> {
    return;
  }
}
