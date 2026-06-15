import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateCommandMenuItemAction,
  UniversalCreateCommandMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/types/workspace-migration-command-menu-item-action.type';
import { fromUniversalOverridesToCommandMenuItemOverrides } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/command-menu-item/services/utils/from-universal-overrides-to-command-menu-item-overrides.util';
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

  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateCommandMenuItemAction>): Promise<FlatCreateCommandMenuItemAction> {
    const { availabilityObjectMetadataId, frontComponentId, pageLayoutId } =
      resolveUniversalRelationIdentifiersToIds({
        flatEntityMaps: allFlatEntityMaps,
        metadataName: action.metadataName,
        universalForeignKeyValues: action.flatEntity,
      });

    const overrides = isDefined(action.flatEntity.universalOverrides)
      ? fromUniversalOverridesToCommandMenuItemOverrides({
          universalOverrides: action.flatEntity.universalOverrides,
          flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
          flatPageLayoutMaps: allFlatEntityMaps.flatPageLayoutMaps,
        })
      : null;

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'commandMenuItem',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        availabilityObjectMetadataId,
        frontComponentId,
        pageLayoutId,
        overrides,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateCommandMenuItemAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateCommandMenuItemAction>,
  ): Promise<void> {
    return;
  }
}
