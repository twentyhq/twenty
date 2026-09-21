import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SettingPageEntity } from 'src/engine/metadata-modules/setting-page/entities/setting-page.entity';
import {
  FlatDeleteSettingPageAction,
  UniversalDeleteSettingPageAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/setting-page/types/workspace-migration-setting-page-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteSettingPageActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'settingPage',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteSettingPageAction>,
  ): Promise<FlatDeleteSettingPageAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteSettingPageAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const settingPageRepository =
      queryRunner.manager.getRepository<SettingPageEntity>(SettingPageEntity);

    await settingPageRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteSettingPageAction>,
  ): Promise<void> {
    return;
  }
}
