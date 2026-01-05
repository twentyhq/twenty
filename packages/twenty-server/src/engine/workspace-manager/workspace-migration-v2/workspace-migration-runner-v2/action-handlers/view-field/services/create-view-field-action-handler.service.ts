import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { CreateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-field/types/workspace-migration-view-field-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateViewFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'viewField',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateViewFieldAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity } = action;

    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    await viewFieldRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateViewFieldAction>,
  ): Promise<void> {
    return;
  }
}
