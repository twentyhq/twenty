import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import {
  destroyWorkflowRun,
  type WorkflowRunResponse,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const STEP_FILTER_GROUP_ID = 'a1b2c3d4-1111-4a2b-8c3d-000000000001';
const STEP_FILTER_ID = 'a1b2c3d4-2222-4a2b-8c3d-000000000002';
const FILTER_VALUE = 'trigger-me-co';

const WORKFLOW_RUNS_BY_CORE_WORKFLOW_ID_QUERY = `
  query WorkflowRunsByCoreWorkflowId($coreWorkflowId: UUID!) {
    workflowRuns(filter: { coreWorkflowId: { eq: $coreWorkflowId } }) {
      edges {
        node {
          id
          state
        }
      }
    }
  }
`;

type TriggeredWorkflowRun = {
  id: string;
  triggeringRecordId: unknown;
};

const createCompany = async (name: string): Promise<string> => {
  const response = await workflowGraphqlRequest(
    `
      mutation CreateCompany($name: String!) {
        createCompany(data: { name: $name }) {
          id
        }
      }
    `,
    { name },
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createCompany.id;
};

const destroyCompany = async (companyId: string): Promise<void> => {
  await workflowGraphqlRequest(
    `
      mutation DestroyCompany($id: UUID!) {
        destroyCompany(id: $id) {
          id
        }
      }
    `,
    { id: companyId },
  );
};

const findTriggeredWorkflowRuns = async (
  coreWorkflowId: string,
): Promise<TriggeredWorkflowRun[]> => {
  const response = await workflowGraphqlRequest(
    WORKFLOW_RUNS_BY_CORE_WORKFLOW_ID_QUERY,
    { coreWorkflowId },
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workflowRuns.edges.map(
    ({ node }: { node: Pick<WorkflowRunResponse, 'id' | 'state'> }) => ({
      id: node.id,
      triggeringRecordId: node.state?.stepInfos?.trigger?.result?.recordId,
    }),
  );
};

const waitForTriggeredWorkflowRuns = async (
  coreWorkflowId: string,
  maxAttempts = 50,
  intervalMs = 200,
): Promise<TriggeredWorkflowRun[]> => {
  let triggeredWorkflowRuns = await findTriggeredWorkflowRuns(coreWorkflowId);
  let attempts = 0;

  while (triggeredWorkflowRuns.length === 0 && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    triggeredWorkflowRuns = await findTriggeredWorkflowRuns(coreWorkflowId);
    attempts++;
  }

  return triggeredWorkflowRuns;
};

describe('Database event trigger filter (e2e)', () => {
  let coreWorkflowId: string;
  const createdCompanyIds: string[] = [];

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'DB Event Trigger Filter Test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: createdCoreWorkflow.coreWorkflowVersionId,
      trigger: {
        name: 'Company is created',
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'company.created',
          outputSchema: {},
          filter: {
            stepFilterGroups: [
              { id: STEP_FILTER_GROUP_ID, logicalOperator: 'AND' },
            ],
            stepFilters: [
              {
                id: STEP_FILTER_ID,
                type: 'TEXT',
                operand: 'CONTAINS',
                value: FILTER_VALUE,
                stepOutputKey: '{{trigger.properties.after.name}}',
                stepFilterGroupId: STEP_FILTER_GROUP_ID,
              },
            ],
          },
        },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId: createdCoreWorkflow.coreWorkflowVersionId,
      stepType: 'EMPTY',
    });

    await activateCoreWorkflowVersion(
      createdCoreWorkflow.coreWorkflowVersionId,
    );
  });

  afterAll(async () => {
    const triggeredWorkflowRuns =
      await findTriggeredWorkflowRuns(coreWorkflowId);

    for (const { id } of triggeredWorkflowRuns) {
      await destroyWorkflowRun(id);
    }

    for (const companyId of createdCompanyIds) {
      await destroyCompany(companyId);
    }

    await deleteCoreWorkflows([coreWorkflowId]);
  });

  it('starts the workflow only for created records matching the trigger filter', async () => {
    const nonMatchingCompanyId = await createCompany('Unrelated company');

    createdCompanyIds.push(nonMatchingCompanyId);

    const matchingCompanyId = await createCompany(`Acme ${FILTER_VALUE}`);

    createdCompanyIds.push(matchingCompanyId);

    const firstTriggeredWorkflowRuns =
      await waitForTriggeredWorkflowRuns(coreWorkflowId);

    expect(firstTriggeredWorkflowRuns).not.toHaveLength(0);

    await waitForAllJobsToFinish();

    const triggeredWorkflowRuns =
      await findTriggeredWorkflowRuns(coreWorkflowId);

    const triggeringRecordIds = triggeredWorkflowRuns.map(
      ({ triggeringRecordId }) => triggeringRecordId,
    );

    expect(triggeringRecordIds).toEqual([matchingCompanyId]);
  });
});
