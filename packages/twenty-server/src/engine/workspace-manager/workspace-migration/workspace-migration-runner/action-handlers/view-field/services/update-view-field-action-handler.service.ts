import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { FlatUpdateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/types/workspace-migration-view-field-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateViewFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'viewField',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateViewFieldAction>,
  ): Promise<FlatUpdateViewFieldAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewFieldAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { entityId } = flatAction;

    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    const update =
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(flatAction);

    await viewFieldRepository.update(entityId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateViewFieldAction>,
  ): Promise<void> {
    return;
  }
}
