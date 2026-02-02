import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { FlatCreatePageLayoutAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreatePageLayoutActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'pageLayout',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreatePageLayoutAction>,
  ): Promise<FlatCreatePageLayoutAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const pageLayoutRepository =
      queryRunner.manager.getRepository<PageLayoutEntity>(PageLayoutEntity);

    await pageLayoutRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutAction>,
  ): Promise<void> {
    return;
  }
}
