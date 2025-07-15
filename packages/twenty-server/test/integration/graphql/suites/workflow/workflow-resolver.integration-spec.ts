import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

const testWorkflowId = 'd6f9be23-c8e6-42b2-93f5-34ee0f97f1c7';

describe('workflowResolver', () => {
  beforeAll(async () => {
    const queryData = {
      query: `
        mutation CreateOneWorkflow {
          createWorkflow(
            data: {
              name: "Custom Test Workflow"
              id: "${testWorkflowId}"
            }
          ) {
            id
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);
  });

  afterAll(async () => {
    const queryData = {
      query: `
        mutation DestroyOneWorkflow {
          destroyWorkflow(id: "${testWorkflowId}") {
            id
          }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);
  });

  it('should create workflow subEntities', async () => {
    const queryData = {
      query: `
        query FindOneWorkflow {
          workflow(filter: {id: {eq: "${testWorkflowId}"}}) {
            id
            deletedAt
            versions {
              edges {
                node {
                  id
                  deletedAt
                  steps
                }
              }
            }
          }
        }
      `,
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const workflow = response.body.data.workflow;

    expect(workflow.id).toBe(testWorkflowId);
    expect(workflow.deletedAt).toBeNull();
    expect(workflow.versions.edges.length).toBeGreaterThan(0);
    expect(workflow.versions.edges[0].node.deletedAt).toBeNull();
  });

  it('should delete workflow subEntities', async () => {
    const deleteQueryData = {
      query: `
        mutation DeleteOneWorkflow {
          deleteWorkflow(id: "${testWorkflowId}") {
            id
          }
        }
      `,
    };

    const deleteResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(deleteQueryData);

    expect(deleteResponse.status).toBe(200);

    const queryData = {
      query: `
        query FindWorkflow {
          workflow(filter: {
            id: { eq: "${testWorkflowId}" },
            not: { deletedAt: { is: NULL } }
          }) {
            id
            deletedAt
          }
        }
      `,
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const workflow = response.body.data.workflow;

    expect(workflow.id).toBe(testWorkflowId);
    expect(workflow.deletedAt).not.toBeNull();

    const queryWorkflowVersionsData = {
      query: `
        query FindManyWorkflowVersions {
          workflowVersions(filter: {
            workflowId: { eq: "${testWorkflowId}" },
            not: { deletedAt: { is: NULL } }
          }) {
            edges {
              node {
                id
                deletedAt
              }
            }
          }
        }
      `,
    };

    const workflowVersionsResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryWorkflowVersionsData);

    expect(workflowVersionsResponse.status).toBe(200);
    expect(workflowVersionsResponse.body.errors).toBeUndefined();

    const workflowVersions =
      workflowVersionsResponse.body.data.workflowVersions;

    expect(workflowVersions.edges.length).toBeGreaterThan(0);
    expect(workflowVersions.edges[0].node.deletedAt).not.toBeNull();
  });

  it('should restore workflow subEntities', async () => {
    const restoreQueryData = {
      query: `
        mutation RestoreOneWorkflow {
          restoreWorkflow(id: "${testWorkflowId}") {
            id
          }
        }
      `,
    };

    const restoreResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(restoreQueryData);

    expect(restoreResponse.status).toBe(200);

    const queryData = {
      query: `
        query FindOneWorkflow {
          workflow(filter: {id: {eq: "${testWorkflowId}"}}) {
            id
            deletedAt
            versions {
              edges {
                node {
                  id
                  deletedAt
                  steps
                }
              }
            }
          }
        }
      `,
    };

    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData);

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const workflow = response.body.data.workflow;

    expect(workflow.id).toBe(testWorkflowId);
    expect(workflow.deletedAt).toBeNull();
    expect(workflow.versions.edges.length).toBeGreaterThan(0);
    expect(workflow.versions.edges[0].node.deletedAt).toBeNull();
  });
});
