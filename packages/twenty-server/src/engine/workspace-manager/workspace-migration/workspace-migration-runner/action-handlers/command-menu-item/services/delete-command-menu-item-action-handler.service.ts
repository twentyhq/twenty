import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import {
  FlatDeleteCommandMenuItemAction,
  UniversalDeleteCommandMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/types/workspace-migration-command-menu-item-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteCommandMenuItemActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'commandMenuItem',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteCommandMenuItemAction>,
  ): Promise<FlatDeleteCommandMenuItemAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteCommandMenuItemAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const commandMenuItemRepository =
      queryRunner.manager.getRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      );

    await commandMenuItemRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteCommandMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
