import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { CreateViewFilterAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/types/workspace-migration-view-filter-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateViewFilterActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'viewFilter',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateViewFilterAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity } = action;

    const viewFilterRepository =
      queryRunner.manager.getRepository<ViewFilterEntity>(ViewFilterEntity);

    await viewFilterRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateViewFilterAction>,
  ): Promise<void> {
    return;
  }
}
