import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { FlatCreateNavigationMenuItemAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/navigation-menu-item/types/workspace-migration-navigation-menu-item-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateNavigationMenuItemActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'navigationMenuItem',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateNavigationMenuItemAction>,
  ): Promise<FlatCreateNavigationMenuItemAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateNavigationMenuItemAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const navigationMenuItemRepository =
      queryRunner.manager.getRepository<NavigationMenuItemEntity>(
        NavigationMenuItemEntity,
      );

    await navigationMenuItemRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateNavigationMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
