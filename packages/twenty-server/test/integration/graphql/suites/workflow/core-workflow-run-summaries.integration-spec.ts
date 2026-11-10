import { randomUUID } from 'node:crypto';

import request from 'supertest';
import {
  createCoreWorkflow,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { createManualCoreWorkflowDraft } from 'test/integration/graphql/suites/workflow/utils/create-manual-core-workflow-draft.util';
import { runCoreWorkflowVersion } from 'test/integration/graphql/suites/workflow/utils/run-core-workflow-version.util';
import { destroyWorkflowRun } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

const NAME_PREFIX = `Core workflow run summaries ${randomUUID()}`;

const client = request(`http://localhost:${APP_PORT}`);

const CORE_WORKFLOWS_WITH_RUN_SUMMARIES_QUERY = `
  query CoreWorkflowsWithRunSummaries($filter: CoreWorkflowFilterInput) {
    coreWorkflows(first: 200, filter: $filter) {
      edges {
        node {
          id
          trigger {
            type
            databaseEventName
          }
        }
      }
      runSummaries {
        coreWorkflowId
        runCountLast14Days
        recentRuns {
          id
          status
          createdAt
        }
      }
    }
  }
`;

type CoreWorkflowsWithRunSummaries = {
  edges: {
    node: {
      id: string;
      trigger: { type: string; databaseEventName: string | null } | null;
    };
  }[];
  runSummaries: {
    coreWorkflowId: string;
    runCountLast14Days: number;
    recentRuns: { id: string; status: string; createdAt: string }[];
  }[];
};

const listCoreWorkflowsWithRunSummaries =
  async (): Promise<CoreWorkflowsWithRunSummaries> => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: CORE_WORKFLOWS_WITH_RUN_SUMMARIES_QUERY,
        variables: {
          filter: {
            logicalOperator: 'AND',
            rules: [
              { fieldKey: 'NAME', operand: 'CONTAINS', value: NAME_PREFIX },
            ],
          },
        },
      });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.coreWorkflows;
  };

const CORE_WORKFLOW_RUN_SUMMARY_QUERY = `
  query CoreWorkflowRunSummary($coreWorkflowId: UUID!) {
    coreWorkflowRunSummary(coreWorkflowId: $coreWorkflowId) {
      coreWorkflowId
      runCountLast14Days
      isRunCountLowerBound
      recentRuns {
        id
      }
    }
  }
`;

const getCoreWorkflowRunSummary = async (coreWorkflowId: string) => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: CORE_WORKFLOW_RUN_SUMMARY_QUERY,
      variables: { coreWorkflowId },
    });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.coreWorkflowRunSummary;
};

describe('coreWorkflows run summaries (e2e)', () => {
  let manualCoreWorkflowId: string;
  let manualCoreWorkflowVersionId: string;
  let databaseEventCoreWorkflowId: string;
  let workflowRunId: string | undefined;

  beforeAll(async () => {
    ({
      coreWorkflowId: manualCoreWorkflowId,
      coreWorkflowVersionId: manualCoreWorkflowVersionId,
    } = await createManualCoreWorkflowDraft({
      name: `${NAME_PREFIX} manual`,
    }));

    const databaseEventCoreWorkflow = await createCoreWorkflow({
      name: `${NAME_PREFIX} database event`,
    });

    databaseEventCoreWorkflowId = databaseEventCoreWorkflow.coreWorkflowId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: databaseEventCoreWorkflow.coreWorkflowVersionId,
      trigger: {
        name: 'Record is created',
        type: 'DATABASE_EVENT',
        settings: { eventName: 'company.created', outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });
  });

  afterAll(async () => {
    if (isDefined(workflowRunId)) {
      await destroyWorkflowRun(workflowRunId);
    }

    await deleteCoreWorkflows({
      coreWorkflowIds: [manualCoreWorkflowId, databaseEventCoreWorkflowId],
    });
  });

  it('should summarize the trigger of each workflow', async () => {
    const { edges } = await listCoreWorkflowsWithRunSummaries();

    const triggerByCoreWorkflowId = new Map(
      edges.map(({ node }) => [node.id, node.trigger]),
    );

    expect(triggerByCoreWorkflowId.get(manualCoreWorkflowId)).toEqual({
      type: 'MANUAL',
      databaseEventName: null,
    });
    expect(triggerByCoreWorkflowId.get(databaseEventCoreWorkflowId)).toEqual({
      type: 'DATABASE_EVENT',
      databaseEventName: 'company.created',
    });
  });

  it('should return an empty run summary for every listed workflow that never ran', async () => {
    const { edges, runSummaries } = await listCoreWorkflowsWithRunSummaries();

    expect(runSummaries.map(({ coreWorkflowId }) => coreWorkflowId)).toEqual(
      edges.map(({ node }) => node.id),
    );
    expect(
      runSummaries.find(
        ({ coreWorkflowId }) => coreWorkflowId === manualCoreWorkflowId,
      ),
    ).toEqual({
      coreWorkflowId: manualCoreWorkflowId,
      runCountLast14Days: 0,
      recentRuns: [],
    });
  });

  it('should count a run and list it as the most recent one', async () => {
    const { data } = await runCoreWorkflowVersion({
      input: { coreWorkflowVersionId: manualCoreWorkflowVersionId },
      expectToFail: false,
    });

    jestExpectToBeDefined(data.runCoreWorkflowVersion);
    workflowRunId = data.runCoreWorkflowVersion.workflowRunId;

    const { runSummaries } = await listCoreWorkflowsWithRunSummaries();

    const manualRunSummary = runSummaries.find(
      ({ coreWorkflowId }) => coreWorkflowId === manualCoreWorkflowId,
    );

    expect(manualRunSummary?.runCountLast14Days).toBe(1);
    expect(manualRunSummary?.recentRuns).toHaveLength(1);
    expect(manualRunSummary?.recentRuns[0].id).toBe(workflowRunId);
  });

  it('should return the same summary for a single workflow', async () => {
    const { runSummaries } = await listCoreWorkflowsWithRunSummaries();

    const listedRunSummary = runSummaries.find(
      ({ coreWorkflowId }) => coreWorkflowId === manualCoreWorkflowId,
    );

    expect(await getCoreWorkflowRunSummary(manualCoreWorkflowId)).toEqual({
      coreWorkflowId: manualCoreWorkflowId,
      runCountLast14Days: listedRunSummary?.runCountLast14Days,
      isRunCountLowerBound: false,
      recentRuns: listedRunSummary?.recentRuns.map(({ id }) => ({ id })),
    });
  });

  it('should return no summary for an unknown workflow', async () => {
    expect(await getCoreWorkflowRunSummary(randomUUID())).toBeNull();
  });
});
