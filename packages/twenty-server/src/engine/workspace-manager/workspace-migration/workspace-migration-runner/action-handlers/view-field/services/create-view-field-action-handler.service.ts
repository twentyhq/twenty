import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { FlatCreateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field/types/workspace-migration-view-field-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateViewFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'viewField',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateViewFieldAction>,
  ): Promise<FlatCreateViewFieldAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateViewFieldAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    await viewFieldRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateViewFieldAction>,
  ): Promise<void> {
    return;
  }
}
