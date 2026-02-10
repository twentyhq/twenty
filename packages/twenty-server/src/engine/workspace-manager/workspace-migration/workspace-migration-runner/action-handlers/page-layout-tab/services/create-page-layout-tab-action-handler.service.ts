import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import {
  FlatCreatePageLayoutTabAction,
  UniversalCreatePageLayoutTabAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreatePageLayoutTabActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'pageLayoutTab',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreatePageLayoutTabAction>): Promise<FlatCreatePageLayoutTabAction> {
    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutTabAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const pageLayoutTabRepository =
      queryRunner.manager.getRepository<PageLayoutTabEntity>(
        PageLayoutTabEntity,
      );

    await pageLayoutTabRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutTabAction>,
  ): Promise<void> {
    return;
  }
}
