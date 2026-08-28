import request from 'supertest';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

const client = request(`http://localhost:${APP_PORT}`);

const graphql = async (query: string, variables?: Record<string, unknown>) => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({ query, variables });

  expect(response.body.errors).toBeUndefined();

  return response.body.data;
};

const updateStepResponse = (
  workflowVersionId: string,
  step: Record<string, unknown>,
) =>
  client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation UpdateWorkflowVersionStep(
          $input: UpdateWorkflowVersionStepInput!
        ) {
          updateWorkflowVersionStep(input: $input) {
            id
          }
        }
      `,
      variables: { input: { workflowVersionId, step } },
    });

describe('Workflow version malformed validation (e2e)', () => {
  let workflowVersionId: string;
  let createRecordStep: {
    id: string;
    settings: { input: Record<string, unknown> };
  };

  beforeAll(async () => {
    const createData = await graphql(`
      mutation CreateWorkflow {
        createWorkflow(data: { name: "Malformed validation test" }) {
          id
        }
      }
    `);

    const workflowData = await graphql(
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
      { id: createData.createWorkflow.id },
    );

    workflowVersionId = workflowData.workflow.versions.edges[0].node.id;

    await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    await graphql(
      `
        mutation CreateWorkflowVersionStep(
          $input: CreateWorkflowVersionStepInput!
        ) {
          createWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          workflowVersionId,
          stepType: 'CREATE_RECORD',
          parentStepId: 'trigger',
          position: { x: 200, y: 0 },
        },
      },
    );

    const stepsData = await graphql(
      `
        query GetWorkflowVersion($id: UUID!) {
          workflowVersion(filter: { id: { eq: $id } }) {
            steps
          }
        }
      `,
      { id: workflowVersionId },
    );

    createRecordStep = stepsData.workflowVersion.steps.find(
      (step: { type: string }) => step.type === 'CREATE_RECORD',
    );
  });

  const stepWithInput = (input: Record<string, unknown>) => ({
    ...createRecordStep,
    settings: { ...createRecordStep.settings, input },
  });

  it('rejects a bare-string rich text value at write time', async () => {
    const response = await updateStepResponse(
      workflowVersionId,
      stepWithInput({
        objectName: 'note',
        objectRecord: { bodyV2: 'a plain string' },
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
    expect(response.body.errors[0].extensions.subCode).toBe(
      'INVALID_WORKFLOW_VERSION',
    );
    expect(response.body.errors[0].message).toMatch(/rich text/i);
  });

  it('rejects a record step targeting an unknown object', async () => {
    const response = await updateStepResponse(
      workflowVersionId,
      stepWithInput({ objectName: 'ghost', objectRecord: {} }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.subCode).toBe(
      'INVALID_WORKFLOW_VERSION',
    );
    expect(response.body.errors[0].message).toContain('does not exist');
  });

  it('accepts a valid rich text object', async () => {
    const response = await updateStepResponse(
      workflowVersionId,
      stepWithInput({
        objectName: 'note',
        objectRecord: { bodyV2: { markdown: 'hello', blocknote: null } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkflowVersionStep.id).toBe(
      createRecordStep.id,
    );
  });

  it('accepts an incomplete record step whose fields are not filled in yet', async () => {
    const response = await updateStepResponse(
      workflowVersionId,
      stepWithInput({ objectName: 'note', objectRecord: {} }),
    );

    expect(response.body.errors).toBeUndefined();
  });

  it('forbids writing steps through the generic updateWorkflowVersion mutation', async () => {
    const operation = updateOneOperationFactory({
      objectMetadataSingularName: 'workflowVersion',
      gqlFields: 'id',
      recordId: workflowVersionId,
      data: { steps: [] },
    });

    const response = await makeGraphqlAPIRequest(operation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});
