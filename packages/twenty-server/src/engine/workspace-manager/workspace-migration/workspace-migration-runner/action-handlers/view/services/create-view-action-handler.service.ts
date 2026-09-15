import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateViewAction,
  UniversalCreateViewAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view/types/workspace-migration-view-action.type';
import { fromUniversalOverridesToViewOverrides } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/view/services/utils/from-universal-overrides-to-view-overrides.util';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateViewActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'view',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateViewAction>): Promise<FlatCreateViewAction> {
    const {
      calendarFieldMetadataId,
      calendarEndFieldMetadataId,
      kanbanAggregateOperationFieldMetadataId,
      mainGroupByFieldMetadataId,
      objectMetadataId,
    } = resolveUniversalRelationIdentifiersToIds({
      flatEntityMaps: allFlatEntityMaps,
      metadataName: action.metadataName,
      universalForeignKeyValues: action.flatEntity,
    });

    const overrides = isDefined(action.flatEntity.universalOverrides)
      ? fromUniversalOverridesToViewOverrides({
          universalOverrides: action.flatEntity.universalOverrides,
          flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
        })
      : null;

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'view',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        calendarFieldMetadataId,
        calendarEndFieldMetadataId,
        kanbanAggregateOperationFieldMetadataId,
        mainGroupByFieldMetadataId,
        objectMetadataId,
        overrides,
        id: action.id ?? v4(),
        applicationId: flatApplication.id,
        workspaceId,
        viewFieldIds: [],
        viewFieldGroupIds: [],
        viewGroupIds: [],
        viewFilterIds: [],
        viewFilterGroupIds: [],
        viewSortIds: [],
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateViewAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateViewAction>,
  ): Promise<void> {
    return;
  }
}
