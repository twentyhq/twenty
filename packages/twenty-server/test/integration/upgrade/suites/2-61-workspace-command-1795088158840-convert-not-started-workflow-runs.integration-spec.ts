import { randomUUID } from 'crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ConvertNotStartedWorkflowRunsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795088158840-convert-not-started-workflow-runs.command';
import { type RestoreNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795287331295-restore-not-started-workflow-run-status.command';
import { type DropNotStartedWorkflowRunStatusCommand } from 'src/database/commands/upgrade-version-command/2-62/2-62-workspace-command-1795369199914-drop-not-started-workflow-run-status.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-61 workspace command - convert not started workflow runs (integration)', () => {
  let command: ConvertNotStartedWorkflowRunsCommand;
  const insertedRunIds: string[] = [];

  const insertRun = async (status: string): Promise<string> => {
    const workflowRunId = randomUUID();

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."workflowRun" (id, name, "coreWorkflowId", "coreWorkflowVersionId", status, "enqueuedAt", position, state) VALUES ($1, 'Not started conversion', $2, $3, $4, NULL, 0, '{}')`,
      [workflowRunId, randomUUID(), randomUUID(), status],
    );
    insertedRunIds.push(workflowRunId);

    return workflowRunId;
  };

  const readStatuses = async (workflowRunIds: string[]) => {
    const rows: { id: string; status: string; enqueuedAt: Date | null }[] =
      await global.testDataSource.query(
        `SELECT id, status, "enqueuedAt" FROM ${SCHEMA}."workflowRun" WHERE id = ANY($1)`,
        [workflowRunIds],
      );

    return Object.fromEntries(
      rows.map(({ id, status, enqueuedAt }) => [id, { status, enqueuedAt }]),
    );
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<ConvertNotStartedWorkflowRunsCommand>(
      'ConvertNotStartedWorkflowRunsCommand',
    );
    await getAppProviderByClassName<RestoreNotStartedWorkflowRunStatusCommand>(
      'RestoreNotStartedWorkflowRunStatusCommand',
    ).runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  afterAll(async () => {
    await getAppProviderByClassName<DropNotStartedWorkflowRunStatusCommand>(
      'DropNotStartedWorkflowRunStatusCommand',
    ).runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."workflowRun" WHERE id = ANY($1)`,
      [insertedRunIds],
    );
  });

  it('changes nothing on a dry run', async () => {
    const notStartedRunId = await insertRun('NOT_STARTED');

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    expect((await readStatuses([notStartedRunId]))[notStartedRunId]).toEqual({
      status: 'NOT_STARTED',
      enqueuedAt: null,
    });
  });

  it('moves NOT_STARTED runs to ENQUEUED, leaves other runs alone and is a no-op on a second run', async () => {
    const notStartedRunId = await insertRun('NOT_STARTED');
    const completedRunId = await insertRun('COMPLETED');

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await readStatuses([notStartedRunId, completedRunId])).toEqual({
      [notStartedRunId]: { status: 'ENQUEUED', enqueuedAt: null },
      [completedRunId]: { status: 'COMPLETED', enqueuedAt: null },
    });
  });
});
