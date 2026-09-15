import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const GET_CORE_WORKFLOW_QUERY = `
  query GetCoreWorkflow($workspaceWorkflowId: UUID!) {
    coreWorkflow(workspaceWorkflowId: $workspaceWorkflowId) {
      id
      statuses
      lastPublishedVersionId
    }
  }
`;

describe('workflow activation mirrors the core workflow row synchronously (e2e)', () => {
  let workspaceWorkflowId: string;
  let workflowVersionId: string;

  beforeAll(async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "Activation Core Mirror" }) {
          id
          workspaceWorkflowId
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    workspaceWorkflowId =
      createResponse.body.data.createCoreWorkflow.workspaceWorkflowId;

    const versionsResponse = await workflowGraphqlRequest(
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
      { id: workspaceWorkflowId },
    );

    expect(versionsResponse.body.errors).toBeUndefined();

    workflowVersionId =
      versionsResponse.body.data.workflow.versions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Webhook Trigger',
        type: 'WEBHOOK',
        settings: {
          outputSchema: {},
          httpMethod: 'GET',
          authentication: null,
        },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    const createStepResponse = await workflowGraphqlRequest(
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
          stepType: 'CODE',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(createStepResponse.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    await workflowGraphqlRequest(
      `
        mutation DestroyWorkflow($id: ID!) {
          destroyWorkflow(id: $id) {
            id
          }
        }
      `,
      { id: workspaceWorkflowId },
    );
  });

  it('starts with no published version on the core row', async () => {
    const response = await workflowGraphqlRequest(GET_CORE_WORKFLOW_QUERY, {
      workspaceWorkflowId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflow.lastPublishedVersionId).toBeNull();
  });

  it('exposes the published version on the core row as soon as activation returns', async () => {
    const activateResponse = await workflowGraphqlRequest(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId },
    );

    expect(activateResponse.body.errors).toBeUndefined();

    const response = await workflowGraphqlRequest(GET_CORE_WORKFLOW_QUERY, {
      workspaceWorkflowId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.coreWorkflow.lastPublishedVersionId).toBe(
      workflowVersionId,
    );
    expect(response.body.data.coreWorkflow.statuses).toContain('ACTIVE');
  });
});
