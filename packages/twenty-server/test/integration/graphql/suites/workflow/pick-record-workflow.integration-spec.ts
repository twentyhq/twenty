import request from 'supertest';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

const client = request(`http://localhost:${APP_PORT}`);

describe('Pick Record Workflow (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let pickRecordStepId: string | null = null;
  let candidateRecordIds: string[] = [];

  beforeAll(async () => {
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: { name: "Pick Record Test Workflow" }) {
              id
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

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
        variables: { id: createdWorkflowId },
      });

    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    const updateTriggerResponse = await client
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
          id: createdWorkflowVersionId,
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

    expect(updateTriggerResponse.body.errors).toBeUndefined();

    const createStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
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
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'PICK_RECORD',
            parentStepId: 'trigger',
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(createStepResponse.body.errors).toBeUndefined();

    const getStepsResponse = await client
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
        variables: { id: createdWorkflowVersionId },
      });

    const steps = getStepsResponse.body.data.workflowVersion.steps;
    const pickRecordStep = steps.find(
      (step: { type: string }) => step.type === 'PICK_RECORD',
    );

    expect(pickRecordStep).toBeDefined();
    pickRecordStepId = pickRecordStep.id;

    const companiesResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query Companies {
            companies(first: 2) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
      });

    expect(companiesResponse.body.errors).toBeUndefined();
    candidateRecordIds = companiesResponse.body.data.companies.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(candidateRecordIds.length).toBe(2);

    const updateStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            step: {
              ...pickRecordStep,
              settings: {
                ...pickRecordStep.settings,
                input: {
                  objectName: 'company',
                  strategy: 'RANDOM',
                  recordIds: candidateRecordIds,
                },
              },
            },
          },
        },
      });

    expect(updateStepResponse.body.errors).toBeUndefined();

    const activateResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
            activateWorkflowVersion(workflowVersionId: $workflowVersionId)
          }
        `,
        variables: { workflowVersionId: createdWorkflowVersionId },
      });

    expect(activateResponse.body.errors).toBeUndefined();
    expect(activateResponse.body.data.activateWorkflowVersion).toBe(true);
  });

  afterAll(async () => {
    if (createdWorkflowId) {
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyWorkflow($id: ID!) {
              destroyWorkflow(id: $id) {
                id
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });
    }
  });

  const pickRecordOnce = async (): Promise<{ id: string }> => {
    const workflowRunId = await runWorkflowVersion({
      workflowVersionId: createdWorkflowVersionId!,
      payload: {},
    });

    const workflowRun = await waitForWorkflowCompletion(workflowRunId);

    expect(workflowRun?.status).toBe('COMPLETED');
    expect(workflowRun?.state?.stepInfos?.[pickRecordStepId!]?.status).toBe(
      'SUCCESS',
    );

    const result = workflowRun?.state?.stepInfos?.[pickRecordStepId!]
      ?.result as { id: string } | undefined;

    await destroyWorkflowRun(workflowRunId);

    expect(result?.id).toBeDefined();

    return result!;
  };

  it('picks a record and exposes it as the step output', async () => {
    const pickedRecord = await pickRecordOnce();

    expect(candidateRecordIds).toContain(pickedRecord.id);
  });

  it('only ever picks records from the configured pool', async () => {
    for (let runIndex = 0; runIndex < 5; runIndex++) {
      const pickedRecord = await pickRecordOnce();

      expect(candidateRecordIds).toContain(pickedRecord.id);
    }
  });
});
