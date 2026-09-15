import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { isDefined } from 'twenty-shared/utils';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKFLOW_NAME = 'Webhook Id Resolution';

describe('webhook trigger workflow id resolution (e2e)', () => {
  let coreWorkflowId: string;
  let workspaceWorkflowId: string;
  const workflowRunIds: string[] = [];

  const triggerWebhook = (
    workflowIdInPath: string,
    workspaceIdInPath: string = SEED_APPLE_WORKSPACE_ID,
  ) =>
    request(`http://localhost:${APP_PORT}`).get(
      `/webhooks/workflows/${workspaceIdInPath}/${workflowIdInPath}`,
    );

  const triggerWebhookUntilTheMirrorCatchesUp = async (
    workflowIdInPath: string,
  ): Promise<request.Response> => {
    let response = await triggerWebhook(workflowIdInPath);

    for (let attempt = 0; attempt < 20 && response.status !== 200; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      response = await triggerWebhook(workflowIdInPath);
    }

    return response;
  };

  const expectWebhookRanTheWorkflow = async (
    response: request.Response,
  ): Promise<void> => {
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.workflowName).toBe(WORKFLOW_NAME);

    const workflowRunId = response.body.workflowRunId;

    expect(isDefined(workflowRunId)).toBe(true);

    workflowRunIds.push(workflowRunId);

    await waitForWorkflowCompletion(workflowRunId);
  };

  beforeAll(async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "${WORKFLOW_NAME}" }) {
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

    expect(versionsResponse.body.errors).toBeUndefined();

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
    await expectWebhookRanTheWorkflow(
      await triggerWebhookUntilTheMirrorCatchesUp(workspaceWorkflowId),
    );
  });

  it('runs the workflow when the path carries the core workflow id', async () => {
    await expectWebhookRanTheWorkflow(
      await triggerWebhookUntilTheMirrorCatchesUp(coreWorkflowId),
    );
  });

  it('does not run anything for an id that is neither', async () => {
    const response = await triggerWebhook(
      '00000000-0000-4000-8000-000000000000',
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBeUndefined();
  });

  it('does not resolve a core workflow id belonging to another workspace', async () => {
    const response = await triggerWebhook(
      coreWorkflowId,
      SEED_YCOMBINATOR_WORKSPACE_ID,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBeUndefined();
  });
});
