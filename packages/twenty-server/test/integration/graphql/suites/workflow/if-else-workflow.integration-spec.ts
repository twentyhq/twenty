import request from 'supertest';
import { getWorkflowRun } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { ViewFilterOperand } from 'twenty-shared/types';

const client = request(`http://localhost:${APP_PORT}`);

describe('If/Else Workflow (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let ifElseStepId: string | null = null;
  let ifBranchEmptyNodeId: string | null = null;
  let elseBranchEmptyNodeId: string | null = null;
  let ifBranchActionStepId: string | null = null;
  let elseBranchActionStepId: string | null = null;

  beforeAll(async () => {
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: {
              name: "If/Else Test Workflow"
            }) {
              id
              versions {
                edges {
                  node {
                    id
                    status
                  }
                }
              }
            }
          }
        `,
      });

    expect(createWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowId = createWorkflowResponse.body.data.createWorkflow.id;
    createdWorkflowVersionId =
      createWorkflowResponse.body.data.createWorkflow.versions.edges[0].node.id;

    const createIfElseStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff {
                type
                path
                value {
                  id
                  type
                  name
                  settings
                }
              }
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'IF_ELSE',
            parentStepId: 'trigger',
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(createIfElseStepResponse.body.errors).toBeUndefined();
    const stepsDiff =
      createIfElseStepResponse.body.data.createWorkflowVersionStep.stepsDiff;
    const ifElseStepDiff = stepsDiff.find(
      (diff: { type: string; value: { type: string } }) =>
        diff.type === 'CREATE' && diff.value.type === 'IF_ELSE',
    );

    ifElseStepId = ifElseStepDiff.value.id;

    const emptyNodesDiff = stepsDiff.filter(
      (diff: { type: string; value: { type: string } }) =>
        diff.type === 'CREATE' && diff.value.type === 'EMPTY',
    );

    expect(emptyNodesDiff.length).toBe(2);
    ifBranchEmptyNodeId = emptyNodesDiff[0].value.id;
    elseBranchEmptyNodeId = emptyNodesDiff[1].value.id;

    const getWorkflowVersionResponse = await client
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

    const steps = getWorkflowVersionResponse.body.data.workflowVersion.steps;
    const ifElseStep = steps.find(
      (step: { id: string }) => step.id === ifElseStepId,
    );
    const ifFilterGroupId = ifElseStep.settings.input.stepFilterGroups[0].id;

    const updateIfElseStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
            updateWorkflowVersionStep(input: $input) {
              id
              type
              name
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            step: {
              ...ifElseStep,
              settings: {
                ...ifElseStep.settings,
                input: {
                  ...ifElseStep.settings.input,
                  stepFilters: [
                    {
                      id: ifElseStep.settings.input.stepFilters[0].id,
                      type: 'NUMBER',
                      stepOutputKey: 'trigger.number',
                      operand: ViewFilterOperand.IS,
                      value: '10',
                      stepFilterGroupId: ifFilterGroupId,
                      positionInStepFilterGroup: 0,
                    },
                  ],
                },
              },
            },
          },
        },
      });

    expect(updateIfElseStepResponse.body.errors).toBeUndefined();

    const createIfBranchStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff {
                type
                path
                value {
                  id
                  type
                  name
                }
              }
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'DELAY',
            parentStepId: ifBranchEmptyNodeId,
            position: { x: 0, y: 200 },
          },
        },
      });

    expect(createIfBranchStepResponse.body.errors).toBeUndefined();
    const ifBranchStepsDiff =
      createIfBranchStepResponse.body.data.createWorkflowVersionStep.stepsDiff;
    const ifBranchStepDiff = ifBranchStepsDiff.find(
      (diff: { type: string; value: { type: string } }) =>
        diff.type === 'CREATE' && diff.value.type === 'DELAY',
    );

    ifBranchActionStepId = ifBranchStepDiff.value.id;

    const createElseBranchStepResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
            createWorkflowVersionStep(input: $input) {
              stepsDiff {
                type
                path
                value {
                  id
                  type
                  name
                }
              }
            }
          }
        `,
        variables: {
          input: {
            workflowVersionId: createdWorkflowVersionId,
            stepType: 'DELAY',
            parentStepId: elseBranchEmptyNodeId,
            position: { x: 400, y: 200 },
          },
        },
      });

    expect(createElseBranchStepResponse.body.errors).toBeUndefined();
    const elseBranchStepsDiff =
      createElseBranchStepResponse.body.data.createWorkflowVersionStep
        .stepsDiff;
    const elseBranchStepDiff = elseBranchStepsDiff.find(
      (diff: { type: string; value: { type: string } }) =>
        diff.type === 'CREATE' && diff.value.type === 'DELAY',
    );

    elseBranchActionStepId = elseBranchStepDiff.value.id;

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
            activateWorkflowVersion(workflowVersionId: $workflowVersionId) {
              id
              status
            }
          }
        `,
        variables: { workflowVersionId: createdWorkflowVersionId },
      });
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

  describe('Workflow structure', () => {
    it('should verify If/Else workflow exists and is active', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindWorkflow($id: UUID!) {
              workflow(filter: { id: { eq: $id } }) {
                id
                name
                lastPublishedVersionId
                statuses
              }
            }
          `,
          variables: { id: createdWorkflowId },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.workflow).toBeDefined();
      expect(response.body.data.workflow.id).toBe(createdWorkflowId);
      expect(response.body.data.workflow.name).toBe('If/Else Test Workflow');
      expect(response.body.data.workflow.lastPublishedVersionId).toBe(
        createdWorkflowVersionId,
      );
      expect(response.body.data.workflow.statuses).toContain('ACTIVE');
    });

    it('should verify If/Else workflow version has correct structure', async () => {
      const response = await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            query FindWorkflowVersion($id: UUID!) {
              workflowVersion(filter: { id: { eq: $id } }) {
                id
                name
                status
                trigger
                steps
              }
            }
          `,
          variables: { id: createdWorkflowVersionId },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const workflowVersion = response.body.data.workflowVersion;

      expect(workflowVersion).toBeDefined();
      expect(workflowVersion.status).toBe('ACTIVE');

      const trigger = workflowVersion.trigger;

      expect(trigger.type).toBe('MANUAL');
      expect(trigger.nextStepIds).toContain(ifElseStepId);

      const steps = workflowVersion.steps;

      const ifElseStep = steps.find(
        (step: { id: string }) => step.id === ifElseStepId,
      );

      expect(ifElseStep).toBeDefined();
      expect(ifElseStep.type).toBe('IF_ELSE');
      expect(ifElseStep.name).toBe('If/Else');
      expect(ifElseStep.settings.input.branches).toBeDefined();
      expect(ifElseStep.settings.input.branches.length).toBe(2);
      expect(ifElseStep.settings.input.stepFilterGroups).toBeDefined();
      expect(ifElseStep.settings.input.stepFilters).toBeDefined();
    });
  });

  describe('If/Else branching execution', () => {
    it('should execute IF branch when condition is true', async () => {
      const runWorkflowResponse = await client
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
              workflowVersionId: createdWorkflowVersionId,
              payload: { number: 10 },
            },
          },
        });

      expect(runWorkflowResponse.status).toBe(200);
      expect(runWorkflowResponse.body.errors).toBeUndefined();
      expect(
        runWorkflowResponse.body.data.runWorkflowVersion.workflowRunId,
      ).toBeDefined();

      const workflowRunId =
        runWorkflowResponse.body.data.runWorkflowVersion.workflowRunId;

      let workflowRun = await getWorkflowRun(workflowRunId);
      let attempts = 0;

      while (
        workflowRun?.status === 'RUNNING' &&
        attempts < 30 &&
        workflowRun !== null
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        workflowRun = await getWorkflowRun(workflowRunId);
        attempts++;
      }

      expect(workflowRun).toBeDefined();
      expect(workflowRun?.status).toBe('COMPLETED');
      expect(workflowRun?.state?.stepInfos).toBeDefined();

      expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('SUCCESS');

      expect(workflowRun?.state?.stepInfos?.[ifElseStepId!]?.status).toBe(
        'SUCCESS',
      );

      expect(
        workflowRun?.state?.stepInfos?.[ifBranchActionStepId!]?.status,
      ).toBe('SUCCESS');

      expect(
        workflowRun?.state?.stepInfos?.[elseBranchActionStepId!]?.status,
      ).toBe('NOT_STARTED');

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyWorkflowRun($id: ID!) {
              destroyWorkflowRun(id: $id) {
                id
              }
            }
          `,
          variables: { id: workflowRunId },
        });
    });

    it('should execute ELSE branch when condition is false', async () => {
      const runWorkflowResponse = await client
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
              workflowVersionId: createdWorkflowVersionId,
              payload: { number: 5 },
            },
          },
        });

      expect(runWorkflowResponse.status).toBe(200);
      expect(runWorkflowResponse.body.errors).toBeUndefined();
      expect(
        runWorkflowResponse.body.data.runWorkflowVersion.workflowRunId,
      ).toBeDefined();

      const workflowRunId =
        runWorkflowResponse.body.data.runWorkflowVersion.workflowRunId;

      let workflowRun = await getWorkflowRun(workflowRunId);
      let attempts = 0;

      while (
        workflowRun?.status === 'RUNNING' &&
        attempts < 30 &&
        workflowRun !== null
      ) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        workflowRun = await getWorkflowRun(workflowRunId);
        attempts++;
      }

      expect(workflowRun).toBeDefined();
      expect(workflowRun?.status).toBe('COMPLETED');
      expect(workflowRun?.state?.stepInfos).toBeDefined();

      expect(workflowRun?.state?.stepInfos?.trigger?.status).toBe('SUCCESS');

      expect(workflowRun?.state?.stepInfos?.[ifElseStepId!]?.status).toBe(
        'SUCCESS',
      );

      expect(
        workflowRun?.state?.stepInfos?.[ifBranchActionStepId!]?.status,
      ).toBe('NOT_STARTED');

      expect(
        workflowRun?.state?.stepInfos?.[elseBranchActionStepId!]?.status,
      ).toBe('SUCCESS');

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation DestroyWorkflowRun($id: ID!) {
              destroyWorkflowRun(id: $id) {
                id
              }
            }
          `,
          variables: { id: workflowRunId },
        });
    });
  });
});
