import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import {
  STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
  STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION_WITHOUT_NOT_STARTED,
  STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-61/constants/restore-not-started-workflow-run-status.constant';
import { type RestoreNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795287331295-restore-not-started-workflow-run-status.command';
import { type DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795369199914-drop-not-started-workflow-run-status.command';
import { computeFieldMetadataOptionOperationsForFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field-metadatas.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const dropNotStartedWorkflowRunStatus = async (): Promise<void> => {
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
  } = await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
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

  const now = new Date().toISOString();
  const statusFieldsToUpdate = [
    {
      ...statusField,
      options: (statusField.options ?? []).filter(
        ({ value }) => value !== 'NOT_STARTED',
      ),
      defaultValue: "'ENQUEUED'",
      updatedAt: now,
    },
  ];

  const result =
    await workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
      {
        shouldDeferActions: false,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
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
                  STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION_WITHOUT_NOT_STARTED,
                updatedAt: now,
              },
            ],
          },
        },
      },
    );

  if (result.status === 'fail') {
    throw new Error(
      `Failed to drop the NOT_STARTED status: ${JSON.stringify(result)}`,
    );
  }
};

const readState = async () => {
  const [{ enumValues }]: { enumValues: string[] }[] =
    await global.testDataSource.query(
      `SELECT enum_range(NULL::${SCHEMA}."workflowRun_status_enum")::text[] AS "enumValues"`,
    );
  const [field]: { defaultValue: string; optionValues: string[] }[] =
    await global.testDataSource.query(
      `SELECT f."defaultValue", array(SELECT o.value FROM core."fieldMetadataOption" o WHERE o."fieldMetadataId" = f.id ORDER BY o.value) AS "optionValues" FROM core."fieldMetadata" f WHERE f."workspaceId" = $1 AND f."universalIdentifier" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        STANDARD_OBJECTS.workflowRun.fields.status.universalIdentifier,
      ],
    );
  const [stopCommandMenuItem]: {
    conditionalAvailabilityExpression: string;
  }[] = await global.testDataSource.query(
    `SELECT "conditionalAvailabilityExpression" FROM core."commandMenuItem" WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [
      SEED_APPLE_WORKSPACE_ID,
      STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
    ],
  );

  return {
    enumValues,
    fieldDefaultValue: field.defaultValue,
    optionValues: field.optionValues,
    stopExpression: stopCommandMenuItem.conditionalAvailabilityExpression,
  };
};

describe('2-61 workspace command - restore not started workflow run status (integration)', () => {
  let command: RestoreNotStartedWorkflowRunStatusCommand;

  beforeAll(async () => {
    command =
      getAppProviderByClassName<RestoreNotStartedWorkflowRunStatusCommand>(
        'RestoreNotStartedWorkflowRunStatusCommand',
      );
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  afterAll(async () => {
    await getAppProviderByClassName<DropNotStartedWorkflowRunStatusCommand>(
      'DropNotStartedWorkflowRunStatusCommand',
    ).runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  it('changes nothing on a workspace that still has the status', async () => {
    const stateBefore = await readState();

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(stateBefore.optionValues).toContain('NOT_STARTED');
    expect(await readState()).toEqual(stateBefore);
  });

  it('changes nothing on a dry run', async () => {
    await dropNotStartedWorkflowRunStatus();
    const stateBefore = await readState();

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(stateBefore.enumValues).not.toContain('NOT_STARTED');
    expect(await readState()).toEqual(stateBefore);
  });

  it('restores the status where it was dropped and is a no-op on a second run', async () => {
    await dropNotStartedWorkflowRunStatus();

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const stateAfterFirstRun = await readState();

    expect(stateAfterFirstRun.enumValues).toContain('NOT_STARTED');
    expect(stateAfterFirstRun.fieldDefaultValue).toBe("'NOT_STARTED'");
    expect(stateAfterFirstRun.optionValues).toContain('NOT_STARTED');
    expect(stateAfterFirstRun.stopExpression).toBe(
      STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
    );

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await readState()).toEqual(stateAfterFirstRun);
  });
});
