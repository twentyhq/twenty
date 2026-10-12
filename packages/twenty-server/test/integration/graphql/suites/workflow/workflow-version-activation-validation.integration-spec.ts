import request from 'supertest';
import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';

const client = request(`http://localhost:${APP_PORT}`);

const activateCoreWorkflowVersion = (coreWorkflowVersionId: string) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation ActivateCoreWorkflowVersion($coreWorkflowVersionId: UUID!) {
          activateCoreWorkflowVersion(coreWorkflowVersionId: $coreWorkflowVersionId)
        }
      `,
      variables: { coreWorkflowVersionId },
    });

describe('Workflow version activation validation (e2e)', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Activation validation test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  it('refuses to activate an empty draft, with the issues in the error', async () => {
    const response = await activateCoreWorkflowVersion(coreWorkflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
    expect(response.body.errors[0].message).toMatch(/trigger/i);
  });
});
