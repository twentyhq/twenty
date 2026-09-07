import { Injectable } from '@nestjs/common';

import {
  type GridPosition,
  PageLayoutTabLayoutMode,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreatePageLayoutWidgetAction,
  UniversalCreatePageLayoutWidgetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action.type';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';
import { fromUniversalOverridesToPageLayoutWidgetOverrides } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-overrides-to-page-layout-widget-overrides.util';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

const DEFAULT_LEGACY_GRID_POSITION: GridPosition = {
  row: 0,
  column: 0,
  rowSpan: 1,
  columnSpan: 12,
};

@Injectable()
export class CreatePageLayoutWidgetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'pageLayoutWidget',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreatePageLayoutWidgetAction>): Promise<FlatCreatePageLayoutWidgetAction> {
    const { pageLayoutTabId, objectMetadataId } =
      resolveUniversalRelationIdentifiersToIds({
        flatEntityMaps: allFlatEntityMaps,
        metadataName: action.metadataName,
        universalForeignKeyValues: action.flatEntity,
      });

    const configuration =
      fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
        universalConfiguration: action.flatEntity.universalConfiguration,
        flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
        flatFrontComponentMaps: allFlatEntityMaps.flatFrontComponentMaps,
        flatViewMaps: allFlatEntityMaps.flatViewMaps,
        flatViewFieldGroupMaps: allFlatEntityMaps.flatViewFieldGroupMaps,
      });

    const overrides = isDefined(action.flatEntity.universalOverrides)
      ? fromUniversalOverridesToPageLayoutWidgetOverrides({
          universalOverrides: action.flatEntity.universalOverrides,
          flatPageLayoutTabMaps: allFlatEntityMaps.flatPageLayoutTabMaps,
        })
      : null;

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'pageLayoutWidget',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        configuration,
        overrides,
        pageLayoutTabId,
        objectMetadataId,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutWidgetAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;
    const gridPosition =
      flatEntity.gridPosition ??
      (flatEntity.position?.layoutMode === PageLayoutTabLayoutMode.GRID
        ? {
            row: flatEntity.position.row,
            column: flatEntity.position.column,
            rowSpan: flatEntity.position.rowSpan,
            columnSpan: flatEntity.position.columnSpan,
          }
        : DEFAULT_LEGACY_GRID_POSITION);

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [{ ...flatEntity, gridPosition }],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutWidgetAction>,
  ): Promise<void> {
    return;
  }
}
