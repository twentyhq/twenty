import request from 'supertest';
import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  createDraftFromCoreWorkflowVersion,
  deleteCoreWorkflows,
  deleteLegacyWorkspaceWorkflowRecords,
  findCoreWorkflowVersion,
  linkCoreWorkflowToLegacyWorkspaceIds,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
  let updateRecordStep: {
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

    updateRecordStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'UPDATE_RECORD',
      position: { x: 800, y: 0 },
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

  const updateRecordStepWithFieldsToUpdate = (fieldsToUpdate: string[]) => ({
    ...updateRecordStep,
    settings: {
      ...updateRecordStep.settings,
      input: {
        objectName: 'person',
        objectRecordId: '{{trigger.id}}',
        objectRecord: { jobTitle: 'CTO', companyId: '{{trigger.companyId}}' },
        fieldsToUpdate,
      },
    },
  });

  it('rejects an update step selecting a field the object does not have', async () => {
    const response = await updateStepResponse(
      coreWorkflowVersionId,
      updateRecordStepWithFieldsToUpdate(['jobTitle', 'employer']),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toContain(
      'updates unknown fields of "person": employer',
    );
  });

  it('accepts an update step selecting a relation by field name or join column', async () => {
    for (const fieldsToUpdate of [['company'], ['companyId', 'jobTitle']]) {
      const response = await updateStepResponse(
        coreWorkflowVersionId,
        updateRecordStepWithFieldsToUpdate(fieldsToUpdate),
      );

      expect(response.body.errors).toBeUndefined();
    }
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

describe('Workflow version update step listing a deleted field (e2e)', () => {
  const DELETED_FIELD_NAME = 'workflowStaleUpdateField';
  const PERSON_ID = '20202020-0000-4000-8000-000000000001';

  type UpdateRecordStep = {
    id: string;
    type: string;
    settings: { input: Record<string, unknown> } & Record<string, unknown>;
  } & Record<string, unknown>;

  let coreWorkflowId: string;
  let draftCoreWorkflowVersionId: string;
  let firstUpdateStepId: string;
  let secondUpdateStepId: string;
  let draftStepById: Map<string, UpdateRecordStep>;

  const updateStepOnPerson = (
    step: UpdateRecordStep,
    fieldsToUpdate: string[],
  ) => ({
    ...step,
    settings: {
      ...step.settings,
      input: {
        objectName: 'person',
        objectRecordId: PERSON_ID,
        objectRecord: { jobTitle: 'CTO' },
        fieldsToUpdate,
      },
    },
  });

  const activateResponse = (coreWorkflowVersionId: string) =>
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

  const draftStep = (stepId: string) => {
    const step = draftStepById.get(stepId);

    if (!isDefined(step)) {
      throw new Error(`Step ${stepId} was not copied into the draft`);
    }

    return step;
  };

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata<{
      id: string;
      nameSingular: string;
    }>({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: `
        id
        nameSingular
      `,
    });

    const personObject = objects.find(
      ({ nameSingular }) => nameSingular === 'person',
    );

    if (!isDefined(personObject)) {
      throw new Error('The person object is missing from the test workspace');
    }

    const {
      data: {
        createOneField: { id: deletedFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: DELETED_FIELD_NAME,
        type: FieldMetadataType.TEXT,
        label: 'Workflow Stale Update Field',
        objectMetadataId: personObject.id,
      },
      gqlFields: 'id',
    });

    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Deleted field in fieldsToUpdate test',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;

    const { coreWorkflowVersionId } = createdCoreWorkflow;

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

    const firstUpdateStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'UPDATE_RECORD',
    });

    const secondUpdateStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'UPDATE_RECORD',
      parentStepId: firstUpdateStep.id,
      position: { x: 400, y: 0 },
    });

    firstUpdateStepId = firstUpdateStep.id;
    secondUpdateStepId = secondUpdateStep.id;

    for (const [step, fieldsToUpdate] of [
      [firstUpdateStep, ['jobTitle', DELETED_FIELD_NAME]],
      [secondUpdateStep, ['jobTitle']],
    ] as const) {
      const response = await updateStepResponse(
        coreWorkflowVersionId,
        updateStepOnPerson(step, [...fieldsToUpdate]),
      );

      expect(response.body.errors).toBeUndefined();
    }

    const activation = await activateResponse(coreWorkflowVersionId);

    expect(activation.body.errors).toBeUndefined();

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: deletedFieldMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: 'id',
    });

    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: deletedFieldMetadataId },
    });

    ({ id: draftCoreWorkflowVersionId } =
      await createDraftFromCoreWorkflowVersion({
        coreWorkflowId,
        coreWorkflowVersionIdToCopy: coreWorkflowVersionId,
      }));

    const draft = await findCoreWorkflowVersion<UpdateRecordStep>({
      coreWorkflowVersionId: draftCoreWorkflowVersionId,
    });

    draftStepById = new Map((draft.steps ?? []).map((step) => [step.id, step]));
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
  });

  it('keeps saving a draft copied from a version that lists the deleted field', async () => {
    for (const step of [
      updateStepOnPerson(draftStep(secondUpdateStepId), ['jobTitle', 'city']),
      updateStepOnPerson(draftStep(firstUpdateStepId), [
        'jobTitle',
        DELETED_FIELD_NAME,
      ]),
    ]) {
      const response = await updateStepResponse(
        draftCoreWorkflowVersionId,
        step,
      );

      expect(response.body.errors).toBeUndefined();
    }
  });

  it('refuses adding another unknown field to that step', async () => {
    const response = await updateStepResponse(
      draftCoreWorkflowVersionId,
      updateStepOnPerson(draftStep(firstUpdateStepId), [
        'jobTitle',
        DELETED_FIELD_NAME,
        'employer',
      ]),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toContain(
      'updates unknown fields of "person": employer',
    );
  });

  it('refuses activation while the deleted field is listed', async () => {
    const response = await activateResponse(draftCoreWorkflowVersionId);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.subCode).toBe(
      'NON_ACTIVABLE_WORKFLOW_VERSION',
    );
    expect(response.body.errors[0].message).toContain(
      `does not have: ${DELETED_FIELD_NAME}`,
    );
  });
});
