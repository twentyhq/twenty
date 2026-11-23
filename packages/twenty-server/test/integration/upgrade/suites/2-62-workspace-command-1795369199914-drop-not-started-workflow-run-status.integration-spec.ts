import { randomUUID } from 'crypto';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RestoreNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795287331295-restore-not-started-workflow-run-status.command';
import {
  STOP_WORKFLOW_RUN_AVAILABILITY_EXPRESSION,
  STOP_WORKFLOW_RUN_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-62/constants/drop-not-started-workflow-run-status.constant';
import { type DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795369199914-drop-not-started-workflow-run-status.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflowRun.fields.status.universalIdentifier;

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-62 workspace command - drop not started workflow run status (integration)', () => {
  let command: DropNotStartedWorkflowRunStatusCommand;
  let restoreCommand: RestoreNotStartedWorkflowRunStatusCommand;
  const insertedRunIds: string[] = [];

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
    restoreCommand =
      getAppProviderByClassName<RestoreNotStartedWorkflowRunStatusCommand>(
        'RestoreNotStartedWorkflowRunStatusCommand',
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
    await restoreCommand.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
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
    await restoreCommand.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
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
