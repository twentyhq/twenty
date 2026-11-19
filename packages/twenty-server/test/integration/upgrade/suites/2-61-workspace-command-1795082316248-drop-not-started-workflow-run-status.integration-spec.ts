import { randomUUID } from 'crypto';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import {
  STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
  STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  STOP_WORKFLOW_RUN_LEGACY_AVAILABILITY_EXPRESSION,
} from 'src/database/commands/upgrade-version-command/2-61/constants/drop-not-started-workflow-run-status.constant';
import { type DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795082316248-drop-not-started-workflow-run-status.command';
import { computeFieldMetadataOptionOperationsForFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/compute-field-metadata-option-operations-for-field-metadatas.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.fields.status.universalIdentifier;

const LEGACY_NOT_STARTED_OPTION = {
  id: '20202020-2ec6-40d8-b9e1-1b1e567bcca9',
  value: 'NOT_STARTED',
  label: 'Not started',
  position: 0,
  color: 'gray' as const,
};

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-61 workspace command - drop not started workflow run status (integration)', () => {
  let command: DropNotStartedWorkflowRunStatusCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;
  const insertedRunIds: string[] = [];

  // Reproduces a workspace created before 2.61, whatever metadata the test database was seeded with
  const restoreLegacyStatus = async () => {
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
        STATUS_FIELD_UNIVERSAL_IDENTIFIER
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
    const statusFieldToUpdate = statusOptions.some(
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
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: statusFieldToUpdate,
            },
            fieldMetadataOption:
              computeFieldMetadataOptionOperationsForFieldMetadatas({
                flatFieldMetadatasToUpdate: statusFieldToUpdate,
                existingFlatFieldMetadataOptionMaps:
                  flatFieldMetadataOptionMaps,
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

  const insertNotStartedRun = async (): Promise<string> => {
    const workflowRunId = randomUUID();

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."workflowRun" (id, name, "coreWorkflowId", "coreWorkflowVersionId", status, "enqueuedAt", position, state) VALUES ($1, 'Legacy not started run', $2, $3, 'NOT_STARTED', NULL, 0, '{}')`,
      [workflowRunId, randomUUID(), randomUUID()],
    );
    insertedRunIds.push(workflowRunId);

    return workflowRunId;
  };

  const readState = async (workflowRunId: string) => {
    const [{ enumValues }]: { enumValues: string[] }[] =
      await global.testDataSource.query(
        `SELECT enum_range(NULL::${SCHEMA}."workflowRun_status_enum")::text[] AS "enumValues"`,
      );
    const [{ columnDefault }]: { columnDefault: string }[] =
      await global.testDataSource.query(
        `SELECT column_default AS "columnDefault" FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'workflowRun' AND column_name = 'status'`,
        [SCHEMA],
      );
    const [run]: { status: string; enqueuedAt: Date | null }[] =
      await global.testDataSource.query(
        `SELECT status, "enqueuedAt" FROM ${SCHEMA}."workflowRun" WHERE id = $1`,
        [workflowRunId],
      );
    const [field]: { defaultValue: string; optionValues: string[] }[] =
      await global.testDataSource.query(
        `SELECT f."defaultValue", array(SELECT o.value FROM core."fieldMetadataOption" o WHERE o."fieldMetadataId" = f.id ORDER BY o.value) AS "optionValues" FROM core."fieldMetadata" f WHERE f."workspaceId" = $1 AND f."universalIdentifier" = $2`,
        [SEED_APPLE_WORKSPACE_ID, STATUS_FIELD_UNIVERSAL_IDENTIFIER],
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
      columnDefault,
      run,
      fieldDefaultValue: field.defaultValue,
      optionValues: field.optionValues,
      stopExpression: stopCommandMenuItem.conditionalAvailabilityExpression,
    };
  };

  beforeAll(() => {
    command = getAppProviderByClassName<DropNotStartedWorkflowRunStatusCommand>(
      'DropNotStartedWorkflowRunStatusCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    workspaceMigrationValidateBuildAndRunService =
      getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      );
  });

  afterAll(async () => {
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."workflowRun" WHERE id = ANY($1)`,
      [insertedRunIds],
    );
  });

  it('changes nothing on a dry run', async () => {
    await restoreLegacyStatus();
    const workflowRunId = await insertNotStartedRun();
    const stateBefore = await readState(workflowRunId);

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect(stateBefore.enumValues).toContain('NOT_STARTED');
    expect(await readState(workflowRunId)).toEqual(stateBefore);
  });

  it('converts the runs, drops the status and is a no-op on a second run', async () => {
    await restoreLegacyStatus();
    const workflowRunId = await insertNotStartedRun();

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const stateAfterFirstRun = await readState(workflowRunId);

    expect(stateAfterFirstRun.enumValues).not.toContain('NOT_STARTED');
    expect(stateAfterFirstRun.enumValues).toContain('ENQUEUED');
    expect(stateAfterFirstRun.columnDefault).toMatch(/^'ENQUEUED'::/);
    expect(stateAfterFirstRun.run).toEqual({
      status: 'ENQUEUED',
      enqueuedAt: null,
    });
    expect(stateAfterFirstRun.fieldDefaultValue).toBe("'ENQUEUED'");
    expect(stateAfterFirstRun.optionValues).not.toContain('NOT_STARTED');
    expect(stateAfterFirstRun.stopExpression).toBe(
      STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
    );

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await readState(workflowRunId)).toEqual(stateAfterFirstRun);
  });
});
