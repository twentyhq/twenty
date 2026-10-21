import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdatePageLayoutTabAction,
  UniversalUpdatePageLayoutTabAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import { fromUniversalOverridesToPageLayoutTabOverrides } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-tab/services/utils/from-universal-overrides-to-page-layout-tab-overrides.util';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { resolveUpdateConditionalDisplay } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/resolve-update-conditional-display.util';

@Injectable()
export class UpdatePageLayoutTabActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'pageLayoutTab',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdatePageLayoutTabAction>,
  ): Promise<FlatUpdatePageLayoutTabAction> {
    const { action, allFlatEntityMaps } = context;

    const flatPageLayoutTab = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatPageLayoutTabMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const { universalOverrides, ...updateWithResolvedForeignKeys } =
      resolveUniversalUpdateRelationIdentifiersToIds({
        metadataName: 'pageLayoutTab',
        universalUpdate: action.update,
        allFlatEntityMaps,
      });

    const updateWithConditionalDisplay = resolveUpdateConditionalDisplay({
      update: updateWithResolvedForeignKeys,
      flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
      flatRoleMaps: allFlatEntityMaps.flatRoleMaps,
    });

    const update =
      universalOverrides === undefined
        ? updateWithConditionalDisplay
        : universalOverrides === null
          ? { ...updateWithConditionalDisplay, overrides: null }
          : {
              ...updateWithConditionalDisplay,
              overrides: fromUniversalOverridesToPageLayoutTabOverrides({
                universalOverrides,
                flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
                flatRoleMaps: allFlatEntityMaps.flatRoleMaps,
              }),
            };

    return {
      type: 'update',
      metadataName: 'pageLayoutTab',
      entityId: flatPageLayoutTab.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdatePageLayoutTabAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const pageLayoutTabRepository =
      queryRunner.manager.getRepository<PageLayoutTabEntity>(
        PageLayoutTabEntity,
      );

    await pageLayoutTabRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdatePageLayoutTabAction>,
  ): Promise<void> {
    return;
  }
}
