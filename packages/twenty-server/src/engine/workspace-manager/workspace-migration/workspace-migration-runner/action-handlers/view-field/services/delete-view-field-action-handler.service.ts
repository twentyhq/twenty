import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import {
  FlatDeleteViewFieldAction,
  UniversalDeleteViewFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/types/workspace-migration-view-field-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'viewField',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteViewFieldAction>,
  ): Promise<FlatDeleteViewFieldAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewFieldAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    await viewFieldRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteViewFieldAction>,
  ): Promise<void> {
    return;
  }
}
