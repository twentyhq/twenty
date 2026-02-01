import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { FlatCreateCommandMenuItemAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/types/workspace-migration-command-menu-item-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateCommandMenuItemActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'commandMenuItem',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateCommandMenuItemAction>,
  ): Promise<FlatCreateCommandMenuItemAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateCommandMenuItemAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const commandMenuItemRepository =
      queryRunner.manager.getRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      );

    await commandMenuItemRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateCommandMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
