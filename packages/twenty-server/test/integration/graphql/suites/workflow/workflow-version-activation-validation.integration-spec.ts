import {
  ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION,
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deactivateCoreWorkflowVersion,
  deleteCoreWorkflows,
  findCoreWorkflowVersionById,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const activateVersion = (coreWorkflowVersionId: string) =>
  workflowGraphqlRequest(ACTIVATE_CORE_WORKFLOW_VERSION_MUTATION, {
    coreWorkflowVersionId,
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
    await deleteCoreWorkflows([coreWorkflowId]);
  });

  it('refuses to activate an empty draft, with the issues in the error', async () => {
    const response = await activateVersion(coreWorkflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
    expect(response.body.errors[0].message).toMatch(/trigger/i);
  });

  it('activates a version whose trigger and steps are complete', async () => {
    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'CREATE_RECORD',
    });

    const response = await activateVersion(coreWorkflowVersionId);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.activateCoreWorkflowVersion).toBe(true);

    const coreWorkflowVersion = await findCoreWorkflowVersionById(
      coreWorkflowVersionId,
    );

    expect(coreWorkflowVersion?.status).toBe('ACTIVE');

    await deactivateCoreWorkflowVersion(coreWorkflowVersionId);
  });
});
