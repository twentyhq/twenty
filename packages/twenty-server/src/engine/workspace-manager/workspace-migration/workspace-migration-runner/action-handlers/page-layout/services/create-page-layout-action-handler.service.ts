import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreatePageLayoutAction,
  UniversalCreatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import { findPageLayoutTabIdInCreatePageLayoutContext } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout/services/utils/find-page-layout-tab-id-in-create-page-layout-context.util';
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

    const defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier =
      action.flatEntity
        .defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier;

    if (isDefined(defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier)) {
      defaultTabToFocusOnMobileAndSidePanelId =
        findPageLayoutTabIdInCreatePageLayoutContext({
          universalIdentifier:
            defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
          tabIdByUniversalIdentifier: action.tabIdByUniversalIdentifier,
          flatPageLayoutTabMaps: allFlatEntityMaps.flatPageLayoutTabMaps,
        });

      if (!isDefined(defaultTabToFocusOnMobileAndSidePanelId)) {
        throw new FlatEntityMapsException(
          `Could not resolve defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier to defaultTabToFocusOnMobileAndSidePanelId: no pageLayoutTab found for universal identifier ${defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier}`,
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
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
