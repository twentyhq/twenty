import { randomUUID } from 'node:crypto';

import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

const authHeader = () => ({
  Authorization: `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`,
});
const apiKeyHeader = () => ({
  Authorization: `Bearer ${API_KEY_ACCESS_TOKEN}`,
});

describe('workflowStepMutationsApiKey', () => {
  let workflowId: string;
  let workflowVersionId: string;

  beforeAll(async () => {
    workflowId = randomUUID();

    // Create workflow via user token — sets up the draft version automatically
    const createWorkflowResponse = await client
      .post('/graphql')
      .set(authHeader())
      .send({
        query: `
          mutation {
            createWorkflow(data: { id: "${workflowId}", name: "API Key Step Test Workflow" }) {
              id
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();

    // Fetch the auto-created draft version
    const versionsResponse = await client
      .post('/graphql')
      .set(authHeader())
      .send({
        query: `
          query {
            workflowVersions(filter: { workflowId: { eq: "${workflowId}" } }) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
      });

    expect(versionsResponse.body.errors).toBeUndefined();
    workflowVersionId =
      versionsResponse.body.data.workflowVersions.edges[0].node.id;
  });

  afterAll(async () => {
    await client
      .post('/graphql')
      .set(authHeader())
      .send({
        query: `
          mutation {
            destroyWorkflow(id: "${workflowId}") {
              id
            }
          }
        `,
      });
  });

  it('createWorkflowVersionStep should succeed when called with a workspace API key', async () => {
    const response = await client
      .post('/graphql')
      .set(apiKeyHeader())
      .send({
        query: `
          mutation {
            createWorkflowVersionStep(input: {
              workflowVersionId: "${workflowVersionId}"
              stepType: "CODE_ACTION"
            }) {
              steps
            }
          }
        `,
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createWorkflowVersionStep).toBeDefined();
  });

  it('createWorkflowVersionStep should appear in GraphQL introspection', async () => {
    const response = await client
      .post('/graphql')
      .set(apiKeyHeader())
      .send({
        query: `
          query {
            __schema {
              mutationType {
                fields {
                  name
                }
              }
            }
          }
        `,
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const mutationNames: string[] =
      response.body.data.__schema.mutationType.fields.map(
        (f: { name: string }) => f.name,
      );

    expect(mutationNames).toContain('createWorkflowVersionStep');
    expect(mutationNames).toContain('updateWorkflowVersionStep');
    expect(mutationNames).toContain('deleteWorkflowVersionStep');
  });
});
