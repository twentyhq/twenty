import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateCommandMenuItemAction,
  UniversalUpdateCommandMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/types/workspace-migration-command-menu-item-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateCommandMenuItemActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'commandMenuItem',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateCommandMenuItemAction>,
  ): Promise<FlatUpdateCommandMenuItemAction> {
    const { action, allFlatEntityMaps } = context;

    const flatCommandMenuItem = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatCommandMenuItemMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'commandMenuItem',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'commandMenuItem',
      entityId: flatCommandMenuItem.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateCommandMenuItemAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const commandMenuItemRepository =
      queryRunner.manager.getRepository<CommandMenuItemEntity>(
        CommandMenuItemEntity,
      );

    await commandMenuItemRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateCommandMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
