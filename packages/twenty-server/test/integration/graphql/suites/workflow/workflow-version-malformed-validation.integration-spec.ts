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
  let workspaceWorkflowVersionId: string;
  let createRecordStep: {
    id: string;
    settings: { input: Record<string, unknown> };
  };
  let sendEmailStep: {
    id: string;
    settings: { input: Record<string, unknown> };
  };
  let findRecordsStep: {
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

    findRecordsStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'FIND_RECORDS',
      position: { x: 600, y: 0 },
    });

    const legacyIds = await linkCoreWorkflowToLegacyWorkspaceIds({
      coreWorkflowId,
      withWorkspaceRecords: true,
    });

    workspaceWorkflowVersionId = legacyIds.workspaceWorkflowVersionIds[0];
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    await deleteLegacyWorkspaceWorkflowRecords({
      workspaceWorkflowVersionIds: [workspaceWorkflowVersionId],
    });
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

  const findRecordsStepWithOrderBy = (orderBy: Record<string, unknown>) => ({
    ...findRecordsStep,
    settings: {
      ...findRecordsStep.settings,
      input: { objectName: 'company', limit: 1, orderBy },
    },
  });

  it('rejects a find records sort written as a GraphQL order', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      findRecordsStepWithOrderBy({
        gqlOperationOrderBy: [{ name: 'DescNullsLast' }],
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
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

  it('creates upsert record steps without fieldsToUpdate', async () => {
    const upsertRecordStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'UPSERT_RECORD',
      position: { x: 800, y: 0 },
    });

    expect(upsertRecordStep.settings.input).not.toHaveProperty(
      'fieldsToUpdate',
    );
  });

  it('rejects fieldsToUpdate on a create record step, which writes its whole objectRecord', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      stepWithInput({
        objectName: 'note',
        objectRecord: { title: 'Hello' },
        fieldsToUpdate: ['title'],
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toContain(
      'Unrecognized key: "fieldsToUpdate"',
    );
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
