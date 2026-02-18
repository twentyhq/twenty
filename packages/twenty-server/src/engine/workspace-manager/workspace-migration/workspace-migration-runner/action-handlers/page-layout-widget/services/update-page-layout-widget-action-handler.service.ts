import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdatePageLayoutWidgetAction,
  UniversalUpdatePageLayoutWidgetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action.type';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdatePageLayoutWidgetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'pageLayoutWidget',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdatePageLayoutWidgetAction>,
  ): Promise<FlatUpdatePageLayoutWidgetAction> {
    const { action, allFlatEntityMaps } = context;

    const flatPageLayoutWidget = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatPageLayoutWidgetMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const { universalConfiguration, ...updateWithResolvedForeignKeys } =
      resolveUniversalUpdateRelationIdentifiersToIds({
        metadataName: 'pageLayoutWidget',
        universalUpdate: action.update,
        allFlatEntityMaps,
      });

    const update =
      universalConfiguration === undefined
        ? updateWithResolvedForeignKeys
        : {
            ...updateWithResolvedForeignKeys,
            configuration:
              fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
                universalConfiguration,
                flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
                flatViewMaps: allFlatEntityMaps.flatViewMaps,
              }),
          };

    return {
      type: 'update',
      metadataName: 'pageLayoutWidget',
      entityId: flatPageLayoutWidget.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdatePageLayoutWidgetAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const pageLayoutWidgetRepository =
      queryRunner.manager.getRepository<PageLayoutWidgetEntity>(
        PageLayoutWidgetEntity,
      );

    await pageLayoutWidgetRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdatePageLayoutWidgetAction>,
  ): Promise<void> {
    return;
  }
}
