import request from 'supertest';
import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  deleteLegacyWorkspaceWorkflowRecords,
  linkCoreWorkflowToLegacyWorkspaceIds,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

const client = request(`http://localhost:${APP_PORT}`);

const updateStepResponse = (
  coreWorkflowVersionId: string,
  step: Record<string, unknown>,
) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation UpdateCoreWorkflowVersionStep(
          $input: UpdateCoreWorkflowVersionStepInput!
        ) {
          updateCoreWorkflowVersionStep(input: $input) {
            id
          }
        }
      `,
      variables: { input: { coreWorkflowVersionId, step } },
    });

describe('Workflow version malformed validation (e2e)', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  let workspaceWorkflowId: string;
  let workspaceWorkflowVersionId: string;
  let createRecordStep: {
    id: string;
    settings: { input: Record<string, unknown> };
  };
  let sendEmailStep: {
    id: string;
    settings: { input: Record<string, unknown> };
  };

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Malformed validation test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    createRecordStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'CREATE_RECORD',
    });

    sendEmailStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'SEND_EMAIL',
      position: { x: 400, y: 0 },
    });

    const legacyIds = await linkCoreWorkflowToLegacyWorkspaceIds({
      coreWorkflowId,
      withWorkspaceRecords: true,
    });

    workspaceWorkflowId = legacyIds.workspaceWorkflowId;
    workspaceWorkflowVersionId = legacyIds.workspaceWorkflowVersionIds[0];
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    await deleteLegacyWorkspaceWorkflowRecords({ workspaceWorkflowId });
  });

  const sendEmailStepWithBody = (body: string) => ({
    ...sendEmailStep,
    settings: {
      ...sendEmailStep.settings,
      input: { ...sendEmailStep.settings.input, body },
    },
  });

  it('rejects an email body saved as HTML or plain text', async () => {
    for (const body of ['<p>Hello</p>', 'Hello {{trigger.name}},\n\nBye']) {
      const response = await updateStepResponse(
        coreWorkflowVersionId,
        sendEmailStepWithBody(body),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
      expect(response.body.errors[0].message).toContain(
        'must be a serialized email document',
      );
    }
  });

  it('accepts an email body saved as an email document', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      sendEmailStepWithBody(
        JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: 1 },
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
          ],
        }),
      ),
    );

    expect(response.body.errors).toBeUndefined();
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
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toMatch(/rich text/i);
  });

  it('rejects a record step targeting an unknown object', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      stepWithInput({ objectName: 'ghost', objectRecord: {} }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
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

  it('forbids writing steps through the generic updateWorkflowVersion mutation', async () => {
    const operation = updateOneOperationFactory({
      objectMetadataSingularName: 'workflowVersion',
      gqlFields: 'id',
      recordId: workspaceWorkflowVersionId,
      data: { steps: [] },
    });

    const response = await makeGraphqlApiRequest(operation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});
