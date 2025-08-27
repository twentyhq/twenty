import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { CreateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateViewActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_view',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateViewAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { view } = action;

    const { viewFields } = view;

    const viewRepository =
      queryRunner.manager.getRepository<ViewEntity>(ViewEntity);
    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    const createdView = await viewRepository.save({
      ...view,
      workspaceId,
    });

    await viewFieldRepository.save(
      viewFields.map((viewField) => ({
        ...viewField,
        viewId: createdView.id,
        workspaceId,
      })),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateViewAction>,
  ): Promise<void> {
    return;
  }
}
