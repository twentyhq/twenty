import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import {
  STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  STOP_WORKFLOW_RUN_LEGACY_AVAILABILITY_EXPRESSION,
} from 'src/database/commands/upgrade-version-command/2-61/constants/drop-not-started-workflow-run-status.constant';
import { computeFieldMetadataOptionOperationsForFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field-metadatas.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LEGACY_NOT_STARTED_OPTION = {
  id: '20202020-2ec6-40d8-b9e1-1b1e567bcca9',
  value: 'NOT_STARTED',
  label: 'Not started',
  position: 0,
  color: 'gray' as const,
};

// Reproduces a workspace created before 2.61, whatever metadata the test database was seeded with
export const restoreLegacyNotStartedWorkflowRunStatus = async (
  workspaceId: string,
): Promise<void> => {
  const workspaceCacheService =
    getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');
  const workspaceMigrationValidateBuildAndRunService =
    getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
      'WorkspaceMigrationValidateBuildAndRunService',
    );

  const {
    flatFieldMetadataMaps,
    flatFieldMetadataOptionMaps,
    flatCommandMenuItemMaps,
  } = await workspaceCacheService.getOrRecompute(workspaceId, [
    'flatFieldMetadataMaps',
    'flatFieldMetadataOptionMaps',
    'flatCommandMenuItemMaps',
  ]);

  const statusField =
    flatFieldMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.workflowRun.fields.status.universalIdentifier
    ];
  const stopCommandMenuItem =
    flatCommandMenuItemMaps.byUniversalIdentifier[
      STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER
    ];

  if (
    !isDefined(statusField) ||
    !isFlatFieldMetadataOfType(statusField, FieldMetadataType.SELECT) ||
    !isDefined(stopCommandMenuItem)
  ) {
    throw new Error('Seeded workspace is missing the workflowRun metadata');
  }

  const statusOptions = statusField.options ?? [];
  const statusFieldsToUpdate = statusOptions.some(
    ({ value }) => value === LEGACY_NOT_STARTED_OPTION.value,
  )
    ? []
    : [
        {
          ...statusField,
          options: [LEGACY_NOT_STARTED_OPTION, ...statusOptions],
          defaultValue: "'NOT_STARTED'",
          updatedAt: new Date().toISOString(),
        },
      ];

  const result =
    await workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
      {
        shouldDeferActions: false,
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: statusFieldsToUpdate,
          },
          fieldMetadataOption:
            computeFieldMetadataOptionOperationsForFieldMetadatas({
              flatFieldMetadatasToUpdate: statusFieldsToUpdate,
              existingFlatFieldMetadataOptionMaps: flatFieldMetadataOptionMaps,
              applicationUniversalIdentifier:
                TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            }),
          commandMenuItem: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [
              {
                ...stopCommandMenuItem,
                conditionalAvailabilityExpression:
                  STOP_WORKFLOW_RUN_LEGACY_AVAILABILITY_EXPRESSION,
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        },
      },
    );

  if (result.status === 'fail') {
    throw new Error(
      `Failed to restore the legacy status: ${JSON.stringify(result)}`,
    );
  }
};
