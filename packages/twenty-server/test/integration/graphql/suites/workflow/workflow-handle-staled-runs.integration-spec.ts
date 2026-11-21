import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);
const ONE_HOUR_MS = 60 * 60 * 1000;

describe('workflow stale-run recovery', () => {
  const coreWorkflowId = randomUUID();
  const coreWorkflowVersionId = randomUUID();
  const trigger = {
    name: 'Stale-run recovery trigger',
    type: 'MANUAL',
    settings: { outputSchema: {} },
    nextStepIds: [],
  };

  const handleStaledRuns = () =>
    getAppProviderByClassName<WorkflowHandleStaledRunsWorkspaceService>(
      'WorkflowHandleStaledRunsWorkspaceService',
    ).handleStaledRunsForWorkspace(workspaceId);

  const insertRun = async ({
    status,
    enqueuedAt,
  }: {
    status: 'ENQUEUED' | 'NOT_STARTED';
    enqueuedAt: Date | null;
  }): Promise<string> => {
    const workflowRunId = randomUUID();

    await global.testDataSource.query(
      `INSERT INTO "${schema}"."workflowRun" (id, name, "coreWorkflowId", "coreWorkflowVersionId", status, "enqueuedAt", position, state) VALUES ($1, 'Stale-run recovery', $2, $3, $4, $5, 0, $6)`,
      [
        workflowRunId,
        coreWorkflowId,
        coreWorkflowVersionId,
        status,
        enqueuedAt,
        JSON.stringify({
          flow: { trigger, steps: [] },
          stepInfos: { trigger: { status: 'NOT_STARTED', result: {} } },
        }),
      ],
    );

    return workflowRunId;
  };

  const getRun = async (workflowRunId: string) => {
    const [workflowRun] = await global.testDataSource.query(
      `SELECT status, "enqueuedAt" FROM "${schema}"."workflowRun" WHERE id = $1`,
      [workflowRunId],
    );

    return workflowRun;
  };

  const waitForRun = async (workflowRunId: string, status: string) => {
    for (let attempt = 0; attempt < 600; attempt++) {
      if ((await getRun(workflowRunId))?.status === status) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect((await getRun(workflowRunId))?.status).toBe(status);
  };

  beforeAll(async () => {
    jest.useRealTimers();

    const [workspace] = await global.testDataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1`,
      [workspaceId],
    );

    await global.testDataSource.query(
      `INSERT INTO core.workflow (id, "workspaceId", "applicationId", "universalIdentifier", name, "lastPublishedCoreWorkflowVersionId") VALUES ($1, $2, $3, $4, 'Stale-run recovery', $5)`,
      [
        coreWorkflowId,
        workspaceId,
        workspace.workspaceCustomApplicationId,
        randomUUID(),
        coreWorkflowVersionId,
      ],
    );
    await global.testDataSource.query(
      `INSERT INTO core."workflowVersion" (id, "workspaceId", "applicationId", "universalIdentifier", "coreWorkflowId", status, triggers, steps) VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6, '[]')`,
      [
        coreWorkflowVersionId,
        workspaceId,
        workspace.workspaceCustomApplicationId,
        randomUUID(),
        coreWorkflowId,
        JSON.stringify([trigger]),
      ],
    );
    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      workspaceId,
      ['flatWorkflowMaps', 'flatWorkflowVersionMaps'],
    );
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
      [coreWorkflowId],
    );
    await global.testDataSource.query(
      `DELETE FROM core."workflowVersion" WHERE id = $1`,
      [coreWorkflowVersionId],
    );
    await global.testDataSource.query(
      `DELETE FROM core.workflow WHERE id = $1`,
      [coreWorkflowId],
    );
    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      workspaceId,
      ['flatWorkflowMaps', 'flatWorkflowVersionMaps'],
    );
    jest.useFakeTimers();
  });

  it('gives a new job to a lost ENQUEUED run and to a leftover NOT_STARTED run, leaving a fresh one alone', async () => {
    const lostRunId = await insertRun({
      status: 'ENQUEUED',
      enqueuedAt: new Date(Date.now() - 2 * ONE_HOUR_MS),
    });
    const leftoverRunId = await insertRun({
      status: 'NOT_STARTED',
      enqueuedAt: null,
    });
    const freshRunId = await insertRun({
      status: 'ENQUEUED',
      enqueuedAt: new Date(),
    });

    await handleStaledRuns();

    await waitForRun(lostRunId, 'COMPLETED');
    await waitForRun(leftoverRunId, 'COMPLETED');
    expect((await getRun(freshRunId)).status).toBe('ENQUEUED');
  });

  it('lets overlapping sweeps give a lost run a single job', async () => {
    const lostRunId = await insertRun({
      status: 'ENQUEUED',
      enqueuedAt: new Date(Date.now() - 2 * ONE_HOUR_MS),
    });
    const addJob = jest.spyOn(
      global.app.get<MessageQueueService>(
        getQueueToken(MessageQueue.workflowQueue),
      ),
      'add',
    );

    await Promise.all([handleStaledRuns(), handleStaledRuns()]);

    expect(
      addJob.mock.calls.filter(
        ([jobName, , options]) =>
          jobName === RUN_WORKFLOW_JOB_NAME && options.id === lostRunId,
      ),
    ).toHaveLength(1);
    await waitForRun(lostRunId, 'COMPLETED');
  });
});
