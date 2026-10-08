import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = async (query: string, variables?: Record<string, unknown>) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

const graphqlOrFail = async (
  query: string,
  variables?: Record<string, unknown>,
) => {
  const response = await graphql(query, variables);

  expect(response.body.errors).toBeUndefined();

  return response.body.data;
};

const validateWorkflowVersion = (workflowVersionId: string) =>
  graphql(
    `
      mutation ValidateWorkflowVersion($workflowVersionId: UUID!) {
        validateWorkflowVersion(workflowVersionId: $workflowVersionId)
      }
    `,
    { workflowVersionId },
  );

const activateWorkflowVersion = (workflowVersionId: string) =>
  graphql(
    `
      mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
        activateWorkflowVersion(workflowVersionId: $workflowVersionId)
      }
    `,
    { workflowVersionId },
  );

describe('Workflow version activation validation (e2e)', () => {
  let workflowVersionId: string;

  beforeAll(async () => {
    const createData = await graphqlOrFail(`
      mutation CreateWorkflow {
        createWorkflow(data: { name: "Activation validation test" }) {
          id
        }
      }
    `);

    const workflowData = await graphqlOrFail(
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
      { id: createData.createWorkflow.id },
    );

    workflowVersionId = workflowData.workflow.versions.edges[0].node.id;
  });

  it('refuses to validate an empty draft, with the issues in the error', async () => {
    const response = await validateWorkflowVersion(workflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
    expect(response.body.errors[0].message).toMatch(/trigger/i);
  });

  it('refuses activation with the same error as validation', async () => {
    const response = await activateWorkflowVersion(workflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
  });

  it('validates a version whose trigger and steps are complete without activating it', async () => {
    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await graphqlOrFail(
      `
        mutation CreateWorkflowVersionStep(
          $input: CreateWorkflowVersionStepInput!
        ) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId,
          stepType: 'CREATE_RECORD',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    const response = await validateWorkflowVersion(workflowVersionId);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.validateWorkflowVersion).toBe(true);

    const statusData = await graphqlOrFail(
      `
        query GetWorkflowVersion($id: UUID!) {
          workflowVersion(filter: { id: { eq: $id } }) {
            status
          }
        }
      `,
      { id: workflowVersionId },
    );

    expect(statusData.workflowVersion.status).toBe('DRAFT');
  });
});
