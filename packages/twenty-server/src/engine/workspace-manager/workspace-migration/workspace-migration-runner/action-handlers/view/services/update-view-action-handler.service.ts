import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { FlatUpdateViewAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/types/workspace-migration-view-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateViewActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'view',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateViewAction>,
  ): Promise<FlatUpdateViewAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { entityId } = flatAction;

    const viewRepository =
      queryRunner.manager.getRepository<ViewEntity>(ViewEntity);

    await viewRepository.update(
      entityId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(flatAction),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewAction>,
  ): Promise<void> {
    return;
  }
}
