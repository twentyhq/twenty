import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = (query: string, variables?: object) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

describe('workflowVersionContent (e2e)', () => {
  let workflowId: string;
  let workflowVersionId: string;

  beforeAll(async () => {
    const createResponse = await graphql(`
      mutation {
        createWorkflow(data: { name: "Version Content Query" }) {
          id
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();
    workflowId = createResponse.body.data.createWorkflow.id;

    const getResponse = await graphql(
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
      { id: workflowId },
    );

    workflowVersionId =
      getResponse.body.data.workflow.versions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Content Query Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });
  });

  afterAll(async () => {
    if (workflowId) {
      await graphql(
        `
          mutation DestroyWorkflow($id: ID!) {
            destroyWorkflow(id: $id) {
              id
            }
          }
        `,
        { id: workflowId },
      );
    }
  });

  it('returns the version trigger and steps', async () => {
    const contentResponse = await graphql(
      `
        query GetWorkflowVersionContent($workflowVersionId: UUID!) {
          workflowVersionContent(workflowVersionId: $workflowVersionId) {
            workflowVersionId
            trigger
            steps
          }
        }
      `,
      { workflowVersionId },
    );

    expect(contentResponse.body.errors).toBeUndefined();

    const content = contentResponse.body.data.workflowVersionContent;

    expect(content.workflowVersionId).toBe(workflowVersionId);
    expect(content.trigger.name).toBe('Content Query Trigger');
    expect(content.trigger.type).toBe('MANUAL');
  });
});
