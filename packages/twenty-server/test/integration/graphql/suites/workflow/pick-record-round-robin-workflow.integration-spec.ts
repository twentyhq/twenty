/**
 * @queue-driver: bullmq
 */
import request from 'supertest';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

const client = request(`http://localhost:${APP_PORT}`);

describe('Pick Record Workflow - round robin (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let pickRecordStepId: string | null = null;
  let orderedCandidateRecordIds: string[] = [];

  beforeAll(async () => {
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: { name: "Pick Record Round Robin Test" }) {
              id
            }
          }
        `,
      });

    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;

    const getWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
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
        variables: { id: createdWorkflowId },
      });

    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

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

    await client
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

    const getStepsResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query GetWorkflowVersion($id: UUID!) {
            workflowVersion(filter: { id: { eq: $id } }) {
              steps
            }
          }
        `,
        variables: { id: createdWorkflowVersionId },
      });

    const pickRecordStep =
      getStepsResponse.body.data.workflowVersion.steps.find(
        (step: { type: string }) => step.type === 'PICK_RECORD',
      );

    pickRecordStepId = pickRecordStep.id;

    const companiesResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query Companies {
            companies(first: 3) {
              edges {
                node {
                  id
                }
              }
            }
          }
        `,
      });

    const candidateRecordIds = companiesResponse.body.data.companies.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );

    expect(candidateRecordIds.length).toBe(3);

    // The executor sorts the resolved pool deterministically by id before
    // applying the round-robin cursor, so the expected cycle order is the
    // pool sorted the same way.
    orderedCandidateRecordIds = [...candidateRecordIds].sort(
      (idA: string, idB: string) => idA.localeCompare(idB),
    );

    await client
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
                  strategy: 'ROUND_ROBIN',
                  recordIds: candidateRecordIds,
                },
              },
            },
          },
        },
      });

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

  it('cycles through the pool in order on consecutive runs', async () => {
    const pickedRecordIds: string[] = [];

    for (let runIndex = 0; runIndex < 4; runIndex++) {
      const workflowRunId = await runWorkflowVersion({
        workflowVersionId: createdWorkflowVersionId!,
        payload: {},
      });

      const workflowRun = await waitForWorkflowCompletion(workflowRunId);

      expect(workflowRun?.status).toBe('COMPLETED');

      const result = workflowRun?.state?.stepInfos?.[pickRecordStepId!]
        ?.result as { id: string } | undefined;

      expect(result?.id).toBeDefined();
      pickedRecordIds.push(result!.id);

      await destroyWorkflowRun(workflowRunId);
    }

    expect(pickedRecordIds).toEqual([
      orderedCandidateRecordIds[0],
      orderedCandidateRecordIds[1],
      orderedCandidateRecordIds[2],
      orderedCandidateRecordIds[0],
    ]);
  });
});
