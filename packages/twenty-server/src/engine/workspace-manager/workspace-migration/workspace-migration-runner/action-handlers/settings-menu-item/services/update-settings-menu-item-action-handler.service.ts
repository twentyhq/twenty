import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { SettingsMenuItemEntity } from 'src/engine/metadata-modules/settings-menu-item/entities/settings-menu-item.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateSettingsMenuItemAction,
  UniversalUpdateSettingsMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/settings-menu-item/types/workspace-migration-settings-menu-item-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateSettingsMenuItemActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'settingsMenuItem',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateSettingsMenuItemAction>,
  ): Promise<FlatUpdateSettingsMenuItemAction> {
    const { action, allFlatEntityMaps } = context;

    const flatSettingsMenuItem = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatSettingsMenuItemMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'settingsMenuItem',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'settingsMenuItem',
      entityId: flatSettingsMenuItem.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateSettingsMenuItemAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const settingsMenuItemRepository =
      queryRunner.manager.getRepository<SettingsMenuItemEntity>(
        SettingsMenuItemEntity,
      );

    await settingsMenuItemRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateSettingsMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
