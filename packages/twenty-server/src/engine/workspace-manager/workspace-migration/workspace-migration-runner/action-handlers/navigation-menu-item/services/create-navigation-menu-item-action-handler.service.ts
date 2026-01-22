import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { CreateNavigationMenuItemAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/navigation-menu-item/types/workspace-migration-navigation-menu-item-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateNavigationMenuItemActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'navigationMenuItem',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateNavigationMenuItemAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity } = action;

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
    _context: WorkspaceMigrationActionRunnerArgs<CreateNavigationMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
