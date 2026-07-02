import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('workflowVersionStep API key access', () => {
  let workflowId: string;
  let workflowVersionId: string;

  beforeAll(async () => {
    // Create a workflow with admin user session
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateOneWorkflow {
            createWorkflow(data: { name: "API Key Test Workflow" }) {
              id
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();

    workflowId = createWorkflowResponse.body.data.createWorkflow.id;

    // Fetch the auto-created draft version
    const getWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflow($id: UUID!) {
            workflow(filter: { id: { eq: $id } }) {
              id
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
        variables: { id: workflowId },
      });

    expect(getWorkflowResponse.body.errors).toBeUndefined();

    workflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    // Set up a trigger on the draft version so steps can be added
    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersion($id: UUID!, $data: WorkflowVersionUpdateInput!) {
            updateWorkflowVersion(id: $id, data: $data) {
              id
            }
          }
        `,
        variables: {
          id: workflowVersionId,
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
      });
  });

  afterAll(async () => {
    if (workflowId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyOneWorkflow($id: UUID!) {
              destroyWorkflow(id: $id) { id }
            }
          `,
          variables: { id: workflowId },
        });
    }
  });

  describe('createWorkflowVersionStep', () => {
    it('should succeed with an admin API key', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
              createWorkflowVersionStep(input: $input) {
                stepsDiff
              }
            }
          `,
          variables: {
            input: {
              workflowVersionId,
              stepType: 'CODE',
              parentStepId: 'trigger',
              position: { x: 200, y: 0 },
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createWorkflowVersionStep).toBeDefined();
      expect(
        response.body.data.createWorkflowVersionStep.stepsDiff,
      ).toBeDefined();
    });
  });

  describe('deleteWorkflowVersionStep', () => {
    let stepIdToDelete: string;

    beforeAll(async () => {
      // Create a step to delete (using API key)
      const createResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
              createWorkflowVersionStep(input: $input) {
                stepsDiff
              }
            }
          `,
          variables: {
            input: {
              workflowVersionId,
              stepType: 'CODE',
              parentStepId: 'trigger',
              position: { x: 400, y: 0 },
            },
          },
        });

      expect(createResponse.body.errors).toBeUndefined();

      // Fetch the step ID from the workflow version
      const getVersionResponse = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query GetWorkflowVersion($id: UUID!) {
              workflowVersion(filter: { id: { eq: $id } }) {
                id
                steps
              }
            }
          `,
          variables: { id: workflowVersionId },
        });

      expect(getVersionResponse.body.errors).toBeUndefined();

      const steps = getVersionResponse.body.data.workflowVersion.steps as Array<{
        id: string;
        type: string;
      }>;

      const codeStep = steps.find((step) => step.type === 'CODE');

      stepIdToDelete = codeStep?.id ?? '';
    });

    it('should succeed with an admin API key', async () => {
      expect(stepIdToDelete).toBeDefined();

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DeleteWorkflowVersionStep($input: DeleteWorkflowVersionStepInput!) {
              deleteWorkflowVersionStep(input: $input) {
                stepsDiff
              }
            }
          `,
          variables: {
            input: {
              workflowVersionId,
              stepId: stepIdToDelete,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteWorkflowVersionStep).toBeDefined();
    });
  });

  describe('runWorkflowVersion', () => {
    it('should be rejected with an API key (requires user session)', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation RunWorkflowVersion($input: RunWorkflowVersionInput!) {
              runWorkflowVersion(input: $input) {
                workflowRunId
              }
            }
          `,
          variables: {
            input: {
              workflowVersionId,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Forbidden resource');
    });

    it('should succeed with a user session token', async () => {
      // First activate the version so it can be run
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
              activateWorkflowVersion(workflowVersionId: $workflowVersionId)
            }
          `,
          variables: { workflowVersionId },
        });

      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation RunWorkflowVersion($input: RunWorkflowVersionInput!) {
              runWorkflowVersion(input: $input) {
                workflowRunId
              }
            }
          `,
          variables: {
            input: {
              workflowVersionId,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.runWorkflowVersion.workflowRunId).toBeDefined();

      // Clean up: deactivate the version
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DeactivateWorkflowVersion($workflowVersionId: UUID!) {
              deactivateWorkflowVersion(workflowVersionId: $workflowVersionId)
            }
          `,
          variables: { workflowVersionId },
        });
    });
  });

  describe('testHttpRequest', () => {
    it('should be rejected with an API key (requires user session)', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation TestHttpRequest($input: TestHttpRequestInput!) {
              testHttpRequest(input: $input) {
                statusCode
                body
              }
            }
          `,
          variables: {
            input: {
              url: 'https://httpbin.org/get',
              method: 'GET',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe('Forbidden resource');
    });
  });
});
