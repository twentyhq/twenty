import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { NUMBER_OF_WORKFLOW_RUNS_TO_KEEP } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/number-of-workflow-runs-to-keep';
import { WorkflowCleanWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-clean-workflow-runs.job';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const RUN_NAME = `Clean workflow runs ${randomUUID()}`;

const insertRuns = async ({
  coreWorkflowId,
  status,
  count,
  minutesAgoOffset = 0,
}: {
  coreWorkflowId: string | null;
  status: string;
  count: number;
  minutesAgoOffset?: number;
}) => {
  await globalThis.testDataSource.query(
    `INSERT INTO ${SCHEMA}."workflowRun" (id, name, "coreWorkflowId", status, position, state, "createdAt")
     SELECT gen_random_uuid(), $1, $2, $3, 0, '{}', NOW() - MAKE_INTERVAL(mins => $4 + n)
     FROM generate_series(1, $5) AS n`,
    [RUN_NAME, coreWorkflowId, status, minutesAgoOffset, count],
  );
};

const countRuns = async ({
  coreWorkflowId,
  status,
}: {
  coreWorkflowId: string | null;
  status: string;
}) => {
  const [{ count }] = await globalThis.testDataSource.query(
    `SELECT COUNT(*)::int AS count FROM ${SCHEMA}."workflowRun"
     WHERE name = $1 AND "coreWorkflowId" IS NOT DISTINCT FROM $2 AND status = $3`,
    [RUN_NAME, coreWorkflowId, status],
  );

  return count;
};

describe('WorkflowCleanWorkflowRunsJob (integration)', () => {
  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM ${SCHEMA}."workflowRun" WHERE name = $1`,
      [RUN_NAME],
    );
  });

  it('keeps the newest finished runs per core workflow and leaves unlinked and unfinished runs alone', async () => {
    const crowdedCoreWorkflowId = randomUUID();
    const quietCoreWorkflowId = randomUUID();

    await insertRuns({
      coreWorkflowId: crowdedCoreWorkflowId,
      status: 'COMPLETED',
      count: NUMBER_OF_WORKFLOW_RUNS_TO_KEEP + 3,
    });
    await insertRuns({
      coreWorkflowId: crowdedCoreWorkflowId,
      status: 'RUNNING',
      count: 2,
      minutesAgoOffset: NUMBER_OF_WORKFLOW_RUNS_TO_KEEP + 10,
    });
    await insertRuns({
      coreWorkflowId: quietCoreWorkflowId,
      status: 'FAILED',
      count: 2,
    });
    await insertRuns({ coreWorkflowId: null, status: 'COMPLETED', count: 3 });

    const [oldestKeptRun] = await globalThis.testDataSource.query(
      `SELECT id FROM ${SCHEMA}."workflowRun"
       WHERE name = $1 AND "coreWorkflowId" = $2 AND status = 'COMPLETED'
       ORDER BY "createdAt" DESC OFFSET $3 LIMIT 1`,
      [RUN_NAME, crowdedCoreWorkflowId, NUMBER_OF_WORKFLOW_RUNS_TO_KEEP - 1],
    );

    const job = new WorkflowCleanWorkflowRunsJob(
      getAppProviderByClassName<WorkspaceOrmManager>('WorkspaceOrmManager'),
      globalThis.testDataSource,
    );

    await job.handle({ workspaceId: SEED_APPLE_WORKSPACE_ID });

    expect(
      await countRuns({
        coreWorkflowId: crowdedCoreWorkflowId,
        status: 'COMPLETED',
      }),
    ).toBe(NUMBER_OF_WORKFLOW_RUNS_TO_KEEP);
    expect(
      await countRuns({
        coreWorkflowId: crowdedCoreWorkflowId,
        status: 'RUNNING',
      }),
    ).toBe(2);
    expect(
      await countRuns({
        coreWorkflowId: quietCoreWorkflowId,
        status: 'FAILED',
      }),
    ).toBe(2);
    expect(await countRuns({ coreWorkflowId: null, status: 'COMPLETED' })).toBe(
      3,
    );

    const [{ count: oldestKeptRunCount }] =
      await globalThis.testDataSource.query(
        `SELECT COUNT(*)::int AS count FROM ${SCHEMA}."workflowRun" WHERE id = $1`,
        [oldestKeptRun.id],
      );

    expect(oldestKeptRunCount).toBe(1);
  });
});
