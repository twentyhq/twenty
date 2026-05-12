import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  getSeedFrontComponentCommandMenuItemDefinitions,
  getSeedFrontComponentIds,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-front-component-definitions.util';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

export const prefillFrontComponentCommandMenuItems = async ({
  workspaceId,
  applicationService,
  flatEntityMapsCacheService,
  workspaceMigrationValidateBuildAndRunService,
}: {
  workspaceId: string;
  applicationService: ApplicationService;
  flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
  workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;
}): Promise<void> => {
  const { helloWorldId } = getSeedFrontComponentIds(workspaceId);

  const { flatCommandMenuItemMaps, flatFrontComponentMaps } =
    await flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatCommandMenuItemMaps', 'flatFrontComponentMaps'],
    });

  const frontComponent = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: helloWorldId,
    flatEntityMaps: flatFrontComponentMaps,
  });

  if (!isDefined(frontComponent)) {
    return;
  }

  const { workspaceCustomFlatApplication } =
    await applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
      { workspaceId },
    );

  const definitions =
    getSeedFrontComponentCommandMenuItemDefinitions(workspaceId);

  const now = new Date().toISOString();

  const flatCommandMenuItemsToCreate: FlatCommandMenuItem[] = definitions
    .filter(
      (definition) =>
        !isDefined(
          flatCommandMenuItemMaps.byUniversalIdentifier[
            definition.universalIdentifier
          ],
        ),
    )
    .map((definition) => {
      const definitionFrontComponent = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: definition.frontComponentId,
        flatEntityMaps: flatFrontComponentMaps,
      });

      return {
        id: v4(),
        universalIdentifier: definition.universalIdentifier,
        applicationId: frontComponent.applicationId,
        applicationUniversalIdentifier:
          frontComponent.applicationUniversalIdentifier,
        workspaceId,
        workflowVersionId: null,
        frontComponentId: definition.frontComponentId,
        frontComponentUniversalIdentifier:
          definitionFrontComponent?.universalIdentifier ?? null,
        engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        label: definition.label,
        icon: definition.icon,
        shortLabel: definition.label,
        position: definition.position,
        isPinned: definition.isPinned ?? false,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
        conditionalAvailabilityExpression: null,
        availabilityObjectMetadataId: null,
        availabilityObjectMetadataUniversalIdentifier: null,
        payload: null,
        hotKeys: null,
        pageLayoutId: definition.pageLayoutId ?? null,
        pageLayoutUniversalIdentifier: definition.pageLayoutId ?? null,
        createdAt: now,
        updatedAt: now,
      };
    });

  if (flatCommandMenuItemsToCreate.length === 0) {
    return;
  }

  const result =
    await workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        allFlatEntityOperationByMetadataName: {
          commandMenuItem: {
            flatEntityToCreate: flatCommandMenuItemsToCreate,
            flatEntityToDelete: [],
            flatEntityToUpdate: [],
          },
        },
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
      },
    );

  if (result.status === 'fail') {
    throw new Error(
      `Failed to create front component command menu items for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
    );
  }
};
