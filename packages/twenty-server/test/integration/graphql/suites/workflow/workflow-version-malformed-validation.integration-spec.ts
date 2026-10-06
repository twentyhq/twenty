import {
  CORE_WORKFLOW_MANUAL_TRIGGER,
  type CoreWorkflowStep,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  UPDATE_CORE_WORKFLOW_VERSION_STEP_MUTATION,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';

const updateStepResponse = (
  coreWorkflowVersionId: string,
  step: Record<string, unknown>,
) =>
  workflowGraphqlRequest(UPDATE_CORE_WORKFLOW_VERSION_STEP_MUTATION, {
    input: { coreWorkflowVersionId, step },
  });

describe('Workflow version malformed validation (e2e)', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  let createRecordStep: CoreWorkflowStep;

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Malformed validation test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    createRecordStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'CREATE_RECORD',
    });
  });

  afterAll(async () => {
    await deleteCoreWorkflows([coreWorkflowId]);
  });

  const stepWithInput = (input: Record<string, unknown>) => ({
    ...createRecordStep,
    settings: { ...createRecordStep.settings, input },
  });

  it('rejects a bare-string rich text value at write time', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      stepWithInput({
        objectName: 'note',
        objectRecord: { bodyV2: 'a plain string' },
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatch(/malformed/i);
    expect(response.body.errors[0].message).toMatch(/rich text/i);
  });

  it('rejects a record step targeting an unknown object', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      stepWithInput({ objectName: 'ghost', objectRecord: {} }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatch(/malformed/i);
    expect(response.body.errors[0].message).toContain('does not exist');
  });

  it('accepts a valid rich text object', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      stepWithInput({
        objectName: 'note',
        objectRecord: { bodyV2: { markdown: 'hello', blocknote: null } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateCoreWorkflowVersionStep.id).toBe(
      createRecordStep.id,
    );
  });

  it('accepts an incomplete record step whose fields are not filled in yet', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      stepWithInput({ objectName: 'note', objectRecord: {} }),
    );

    expect(response.body.errors).toBeUndefined();
  });
});
