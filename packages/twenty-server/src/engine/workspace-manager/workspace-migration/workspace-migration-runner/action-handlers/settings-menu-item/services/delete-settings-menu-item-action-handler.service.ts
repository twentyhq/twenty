import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SettingsMenuItemEntity } from 'src/engine/metadata-modules/settings-menu-item/entities/settings-menu-item.entity';
import {
  FlatDeleteSettingsMenuItemAction,
  UniversalDeleteSettingsMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/settings-menu-item/types/workspace-migration-settings-menu-item-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteSettingsMenuItemActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'settingsMenuItem',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteSettingsMenuItemAction>,
  ): Promise<FlatDeleteSettingsMenuItemAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteSettingsMenuItemAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const settingsMenuItemRepository =
      queryRunner.manager.getRepository<SettingsMenuItemEntity>(
        SettingsMenuItemEntity,
      );

    await settingsMenuItemRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteSettingsMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
