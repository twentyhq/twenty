import request from 'supertest';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = async (query: string, variables?: Record<string, unknown>) => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

  expect(response.body.errors).toBeUndefined();

  return response.body.data;
};

describe('Pick Record Workflow - load balanced (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let pickRecordStepId: string | null = null;
  let leastLoadedCompanyId: string | null = null;
  let mostLoadedCompanyId: string | null = null;
  let createdOpportunityId: string | null = null;

  beforeAll(async () => {
    const createWorkflowData = await graphql(`
      mutation CreateWorkflow {
        createWorkflow(data: { name: "Pick Record Load Balanced Test" }) {
          id
        }
      }
    `);

    createdWorkflowId = createWorkflowData.createWorkflow.id;

    const getWorkflowData = await graphql(
      `
        query GetWorkflow($id: UUID!) {
          workflow(filter: { id: { eq: $id } }) {
            versions {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `,
      { id: createdWorkflowId },
    );

    createdWorkflowVersionId =
      getWorkflowData.workflow.versions.edges[0].node.id;

    await graphql(
      `
        mutation UpdateWorkflowVersion($id: UUID!, $data: WorkflowVersionUpdateInput!) {
          updateWorkflowVersion(id: $id, data: $data) {
            id
          }
        }
      `,
      {
        id: createdWorkflowVersionId,
        data: {
          trigger: {
            name: 'Manual Trigger',
            type: 'MANUAL',
            settings: { outputSchema: {} },
            nextStepIds: [],
            position: { x: 0, y: 0 },
          },
        },
      },
    );

    await graphql(
      `
        mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId: createdWorkflowVersionId,
          stepType: 'PICK_RECORD',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    const getStepsData = await graphql(
      `
        query GetWorkflowVersion($id: UUID!) {
          workflowVersion(filter: { id: { eq: $id } }) {
            steps
          }
        }
      `,
      { id: createdWorkflowVersionId },
    );

    const pickRecordStep = getStepsData.workflowVersion.steps.find(
      (step: { type: string }) => step.type === 'PICK_RECORD',
    );

    pickRecordStepId = pickRecordStep.id;

    // Two fresh companies start with zero related opportunities; adding one
    // opportunity to the second makes the first the least loaded candidate.
    const companyOneData = await graphql(`
      mutation {
        createCompany(data: { name: "Pick Record LB company one" }) {
          id
        }
      }
    `);

    const companyTwoData = await graphql(`
      mutation {
        createCompany(data: { name: "Pick Record LB company two" }) {
          id
        }
      }
    `);

    // The executor orders candidates by id before selecting. Attach the
    // opportunity to the id-first company so the least-loaded candidate is the
    // id-second one: load balancing must pick it, which also guards against a
    // regression where a broken count would fall back to the first candidate.
    const [firstSortedCompanyId, secondSortedCompanyId] = [
      companyOneData.createCompany.id,
      companyTwoData.createCompany.id,
    ].sort((idA: string, idB: string) => idA.localeCompare(idB));

    mostLoadedCompanyId = firstSortedCompanyId;
    leastLoadedCompanyId = secondSortedCompanyId;

    const opportunityData = await graphql(
      `
        mutation CreateOpportunity($companyId: UUID!) {
          createOpportunity(
            data: { name: "Pick Record LB Opportunity", companyId: $companyId }
          ) {
            id
          }
        }
      `,
      { companyId: mostLoadedCompanyId },
    );

    createdOpportunityId = opportunityData.createOpportunity.id;

    await graphql(
      `
        mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
          updateWorkflowVersionStep(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          workflowVersionId: createdWorkflowVersionId,
          step: {
            ...pickRecordStep,
            settings: {
              ...pickRecordStep.settings,
              input: {
                objectName: 'company',
                strategy: 'LOAD_BALANCED',
                recordIds: [leastLoadedCompanyId, mostLoadedCompanyId],
                loadBalance: {
                  objectNameSingular: 'opportunity',
                  fieldName: 'company',
                },
              },
            },
          },
        },
      },
    );

    const activateData = await graphql(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId: createdWorkflowVersionId },
    );

    expect(activateData.activateWorkflowVersion).toBe(true);
  });

  afterAll(async () => {
    if (createdOpportunityId) {
      await graphql(
        `
          mutation DeleteOpportunity($id: UUID!) {
            deleteOpportunity(id: $id) {
              id
            }
          }
        `,
        { id: createdOpportunityId },
      );
    }

    for (const companyId of [leastLoadedCompanyId, mostLoadedCompanyId]) {
      if (companyId) {
        await graphql(
          `
            mutation DeleteCompany($id: UUID!) {
              deleteCompany(id: $id) {
                id
              }
            }
          `,
          { id: companyId },
        );
      }
    }

    if (createdWorkflowId) {
      await graphql(
        `
          mutation DestroyWorkflow($id: ID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: createdWorkflowId },
      );
    }
  });

  it('picks the candidate with the fewest related records', async () => {
    const workflowRunId = await runWorkflowVersion({
      workflowVersionId: createdWorkflowVersionId!,
      payload: {},
    });

    const workflowRun = await waitForWorkflowCompletion(workflowRunId);

    expect(workflowRun?.status).toBe('COMPLETED');

    const result = workflowRun?.state?.stepInfos?.[pickRecordStepId!]
      ?.result as { id: string } | undefined;

    await destroyWorkflowRun(workflowRunId);

    expect(result?.id).toBe(leastLoadedCompanyId);
  });
});
