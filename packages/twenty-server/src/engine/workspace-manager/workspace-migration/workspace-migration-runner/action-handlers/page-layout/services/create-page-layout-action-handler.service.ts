import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
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
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreatePageLayoutAction>): Promise<FlatCreatePageLayoutAction> {
    const { objectMetadataId } = resolveUniversalRelationIdentifiersToIds<
      'pageLayout',
      'objectMetadataUniversalIdentifier'
    >({
      flatEntityMaps: allFlatEntityMaps,
      metadataName: 'pageLayout',
      universalForeignKeyValues: {
        objectMetadataUniversalIdentifier:
          action.flatEntity.objectMetadataUniversalIdentifier,
      },
    });

    let defaultTabToFocusOnMobileAndSidePanelId: string | null = null;

    if (
      isDefined(
        action.flatEntity
          .defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
      )
    ) {
      const existingTab = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: allFlatEntityMaps.flatPageLayoutTabMaps,
        universalIdentifier:
          action.flatEntity
            .defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
      });

      if (isDefined(existingTab)) {
        defaultTabToFocusOnMobileAndSidePanelId = existingTab.id;
      }
    }

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
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const pageLayoutRepository =
      queryRunner.manager.getRepository<PageLayoutEntity>(PageLayoutEntity);

    await pageLayoutRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreatePageLayoutAction>,
  ): Promise<void> {
    return;
  }
}
