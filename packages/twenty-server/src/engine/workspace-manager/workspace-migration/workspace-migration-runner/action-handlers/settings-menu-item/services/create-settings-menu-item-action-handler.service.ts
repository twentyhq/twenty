import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateSettingsMenuItemAction,
  UniversalCreateSettingsMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/settings-menu-item/types/workspace-migration-settings-menu-item-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateSettingsMenuItemActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'settingsMenuItem',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateSettingsMenuItemAction>): Promise<FlatCreateSettingsMenuItemAction> {
    const { frontComponentId } = resolveUniversalRelationIdentifiersToIds({
      flatEntityMaps: allFlatEntityMaps,
      metadataName: action.metadataName,
      universalForeignKeyValues: action.flatEntity,
    });

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'settingsMenuItem',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        frontComponentId,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateSettingsMenuItemAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatAction.flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateSettingsMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
