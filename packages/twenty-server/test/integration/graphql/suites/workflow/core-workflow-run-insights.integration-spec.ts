import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { deleteCoreWorkflows } from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { createManualCoreWorkflowDraft } from 'test/integration/graphql/suites/workflow/utils/create-manual-core-workflow-draft.util';
import { runCoreWorkflowVersion } from 'test/integration/graphql/suites/workflow/utils/run-core-workflow-version.util';
import { destroyWorkflowRun } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

const client = request(`http://localhost:${APP_PORT}`);

const CORE_WORKFLOW_RUN_INSIGHTS_QUERY = `
  query CoreWorkflowRunInsights($coreWorkflowId: UUID!, $timeZone: String!) {
    coreWorkflowRunInsights(coreWorkflowId: $coreWorkflowId, timeZone: $timeZone) {
      coreWorkflowId
      runCount
      failedRunCount
      isRunCountLowerBound
      averageDurationInMs
      dailyRunCounts {
        day
        completedRunCount
        failedRunCount
        otherRunCount
      }
      recentFailedRuns {
        id
      }
    }
  }
`;

const queryCoreWorkflowRunInsights = ({
  coreWorkflowId,
  timeZone = 'Europe/Paris',
}: {
  coreWorkflowId: string;
  timeZone?: string;
}) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: CORE_WORKFLOW_RUN_INSIGHTS_QUERY,
      variables: { coreWorkflowId, timeZone },
    });

describe('coreWorkflowRunInsights (e2e)', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  let workflowRunId: string | undefined;

  beforeAll(async () => {
    ({ coreWorkflowId, coreWorkflowVersionId } =
      await createManualCoreWorkflowDraft({
        name: `Core workflow run insights ${randomUUID()}`,
      }));
  });

  afterAll(async () => {
    if (isDefined(workflowRunId)) {
      await destroyWorkflowRun(workflowRunId);
    }

    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  it('should return 14 empty days for a workflow that never ran', async () => {
    const response = await queryCoreWorkflowRunInsights({ coreWorkflowId });

    expect(response.body.errors).toBeUndefined();

    const insights = response.body.data.coreWorkflowRunInsights;

    expect(insights).toMatchObject({
      coreWorkflowId,
      runCount: 0,
      failedRunCount: 0,
      isRunCountLowerBound: false,
      averageDurationInMs: null,
      recentFailedRuns: [],
    });
    expect(insights.dailyRunCounts).toHaveLength(14);
    expect(
      insights.dailyRunCounts.every(
        ({
          completedRunCount,
          failedRunCount,
          otherRunCount,
        }: {
          completedRunCount: number;
          failedRunCount: number;
          otherRunCount: number;
        }) => completedRunCount + failedRunCount + otherRunCount === 0,
      ),
    ).toBe(true);
  });

  it('should count a new run on the last day', async () => {
    const { data } = await runCoreWorkflowVersion({
      input: { coreWorkflowVersionId },
      expectToFail: false,
    });

    jestExpectToBeDefined(data.runCoreWorkflowVersion);
    workflowRunId = data.runCoreWorkflowVersion.workflowRunId;

    const response = await queryCoreWorkflowRunInsights({ coreWorkflowId });

    expect(response.body.errors).toBeUndefined();

    const insights = response.body.data.coreWorkflowRunInsights;
    const lastDay = insights.dailyRunCounts.at(-1);

    expect(insights.runCount).toBe(1);
    expect(
      lastDay.completedRunCount +
        lastDay.failedRunCount +
        lastDay.otherRunCount,
    ).toBe(1);
  });

  it('should return no insights for an unknown workflow', async () => {
    const response = await queryCoreWorkflowRunInsights({
      coreWorkflowId: randomUUID(),
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflowRunInsights).toBeNull();
  });

  it('should reject an invalid time zone', async () => {
    const response = await queryCoreWorkflowRunInsights({
      coreWorkflowId,
      timeZone: 'Not/AZone',
    });

    expect(response.body.errors).toBeDefined();
  });
});
