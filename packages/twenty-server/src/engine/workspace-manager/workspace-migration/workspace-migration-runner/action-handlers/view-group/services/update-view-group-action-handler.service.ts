import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { FlatUpdateViewGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-group/types/workspace-migration-view-group-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateViewGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'viewGroup',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateViewGroupAction>,
  ): Promise<FlatUpdateViewGroupAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewGroupAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const viewGroupRepository =
      queryRunner.manager.getRepository<ViewGroupEntity>(ViewGroupEntity);

    await viewGroupRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewGroupAction>,
  ): Promise<void> {
    return;
  }
}
