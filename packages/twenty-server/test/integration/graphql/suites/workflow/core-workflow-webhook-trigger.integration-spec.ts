import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { destroyWorkflowRun } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('webhook trigger workflow id resolution (e2e)', () => {
  let coreWorkflowId: string;
  let workspaceWorkflowId: string;
  const workflowRunIds: string[] = [];

  const triggerWebhook = (workflowIdInPath: string) =>
    request(`http://localhost:${APP_PORT}`).get(
      `/webhooks/workflows/${SEED_APPLE_WORKSPACE_ID}/${workflowIdInPath}`,
    );

  beforeAll(async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "Webhook Id Resolution" }) {
          id
          workspaceWorkflowId
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();

    coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;
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

    const workflowVersionId =
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

    const activateResponse = await workflowGraphqlRequest(
      `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      { workflowVersionId },
    );

    expect(activateResponse.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    for (const workflowRunId of workflowRunIds) {
      await destroyWorkflowRun(workflowRunId);
    }

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

  it('runs the workflow when the path carries the workspace workflow id', async () => {
    const response = await triggerWebhook(workspaceWorkflowId);

    expect(response.body.success).toBe(true);

    workflowRunIds.push(response.body.workflowRunId);
  });

  it('runs the workflow when the path carries the core workflow id', async () => {
    const response = await triggerWebhook(coreWorkflowId);

    expect(response.body.success).toBe(true);

    workflowRunIds.push(response.body.workflowRunId);
  });

  it('does not run anything for an id that is neither', async () => {
    const response = await triggerWebhook(
      '00000000-0000-4000-8000-000000000000',
    );

    expect(response.body.success).toBeUndefined();
  });
});
