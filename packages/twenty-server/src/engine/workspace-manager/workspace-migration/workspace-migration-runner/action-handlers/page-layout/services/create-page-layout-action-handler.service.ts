import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreatePageLayoutAction,
  UniversalCreatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreatePageLayoutActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'pageLayout',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
    preallocatedIdByUniversalIdentifierByMetadataName,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreatePageLayoutAction>): Promise<FlatCreatePageLayoutAction> {
    const { objectMetadataId, defaultTabToFocusOnMobileAndSidePanelId } =
      resolveUniversalRelationIdentifiersToIds<
        'pageLayout',
        | 'objectMetadataUniversalIdentifier'
        | 'defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier'
      >({
        flatEntityMaps: allFlatEntityMaps,
        metadataName: 'pageLayout',
        universalForeignKeyValues: {
          objectMetadataUniversalIdentifier:
            action.flatEntity.objectMetadataUniversalIdentifier,
          defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
            action.flatEntity
              .defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
        },
        preallocatedIdByUniversalIdentifierByMetadataName,
      });

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'pageLayout',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        objectMetadataId,
        defaultTabToFocusOnMobileAndSidePanelId,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        tabIds: [],
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutAction>,
  ): Promise<void> {
    return;
  }
}
