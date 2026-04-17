import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { QUICK_LEAD_WORKFLOW_VERSION_ID } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflows.util';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const QUICK_LEAD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '5b389a80-345f-42b5-83fa-2e6b6ad95f01';

export const prefillWorkflowCommandMenuItems = async ({
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
  const { workspaceCustomFlatApplication } =
    await applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
      { workspaceId },
    );

  const { flatCommandMenuItemMaps } =
    await flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
      workspaceId,
      flatMapsKeys: ['flatCommandMenuItemMaps'],
    });

  const alreadyExists = isDefined(
    flatCommandMenuItemMaps.byUniversalIdentifier[
      QUICK_LEAD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
    ],
  );

  if (alreadyExists) {
    return;
  }

  const now = new Date().toISOString();

  const quickLeadFlatCommandMenuItem: FlatCommandMenuItem = {
    id: v4(),
    universalIdentifier: QUICK_LEAD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
    applicationId: workspaceCustomFlatApplication.id,
    applicationUniversalIdentifier:
      workspaceCustomFlatApplication.universalIdentifier,
    workspaceId,
    workflowVersionId: QUICK_LEAD_WORKFLOW_VERSION_ID,
    frontComponentId: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
    label: 'Quick Lead',
    icon: 'IconUserPlus',
    shortLabel: 'Quick Lead',
    position: 100,
    isPinned: false,
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression: null,
    availabilityObjectMetadataId: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    payload: null,
    hotKeys: null,
    pageLayoutId: null,
    pageLayoutUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
  };

  const result =
    await workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      {
        allFlatEntityOperationByMetadataName: {
          commandMenuItem: {
            flatEntityToCreate: [quickLeadFlatCommandMenuItem],
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
      `Failed to create Quick Lead command menu item for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
    );
  }
};
