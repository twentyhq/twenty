import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-update.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdatePageLayoutAction,
  UniversalUpdatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdatePageLayoutActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'pageLayout',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdatePageLayoutAction>,
  ): Promise<FlatUpdatePageLayoutAction> {
    const { action, allFlatEntityMaps } = context;

    const flatPageLayout = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatPageLayoutMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const {
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
      ...restUpdate
    } = action.update;

    const transpiledUpdate: FlatEntityUpdate<'pageLayout'> =
      resolveUniversalUpdateRelationIdentifiersToIds({
        metadataName: 'pageLayout',
        universalUpdate: restUpdate,
        allFlatEntityMaps,
      });

    if (isDefined(defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier)) {
      const flatPageLayoutTab = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: allFlatEntityMaps.flatPageLayoutTabMaps,
        universalIdentifier:
          defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
      });

      if (!isDefined(flatPageLayoutTab)) {
        throw new FlatEntityMapsException(
          `Could not resolve defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier to defaultTabToFocusOnMobileAndSidePanelId: no pageLayoutTab found for universal identifier ${defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier}`,
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      transpiledUpdate.defaultTabToFocusOnMobileAndSidePanelId =
        flatPageLayoutTab.id;
    }

    return {
      type: 'update',
      metadataName: 'pageLayout',
      entityId: flatPageLayout.id,
      update: transpiledUpdate,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdatePageLayoutAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const pageLayoutRepository =
      queryRunner.manager.getRepository<PageLayoutEntity>(PageLayoutEntity);

    await pageLayoutRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdatePageLayoutAction>,
  ): Promise<void> {
    return;
  }
}
