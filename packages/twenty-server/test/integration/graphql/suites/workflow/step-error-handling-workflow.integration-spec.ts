import { STEP_RETRY_DELAYS_MS } from 'twenty-shared/workflow';
import request from 'supertest';
import {
  destroyWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

import {
  type WorkflowAction,
  type WorkflowHttpRequestAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';

const client = request(`http://localhost:${APP_PORT}`);

const BLOCKED_REQUEST_URL = 'http://127.0.0.1:1/';

const TOTAL_RETRY_DELAY_MS = STEP_RETRY_DELAYS_MS.reduce(
  (total, delay) => total + delay,
  0,
);

const RETRY_TEST_TIMEOUT_MS = TOTAL_RETRY_DELAY_MS + 60_000;

describe('Step error handling workflow (e2e)', () => {
  let createdWorkflowId: string | null = null;
  let createdWorkflowVersionId: string | null = null;
  let httpRequestStepId: string | null = null;
  let filterStepId: string | null = null;

  const getSteps = async (): Promise<WorkflowAction[]> => {
    const response = await client
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

    expect(response.body.errors).toBeUndefined();

    return response.body.data.workflowVersion.steps;
  };

  const createStep = async ({
    stepType,
    parentStepId,
  }: {
    stepType: string;
    parentStepId: string;
  }) => {
    const response = await client
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
            stepType,
            parentStepId,
            position: { x: 200, y: 0 },
          },
        },
      });

    expect(response.body.errors).toBeUndefined();
  };

  const setUpFailingHttpRequestStep = async ({
    continueOnFailure,
    retryOnFailure = 0,
  }: {
    continueOnFailure: boolean;
    retryOnFailure?: number;
  }) => {
    const steps = await getSteps();

    const httpRequestStep = steps.find(
      (step) => step.id === httpRequestStepId,
    ) as WorkflowHttpRequestAction;

    const response = await client
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
              ...httpRequestStep,
              settings: {
                ...httpRequestStep.settings,
                input: {
                  ...httpRequestStep.settings.input,
                  url: BLOCKED_REQUEST_URL,
                },
                errorHandlingOptions: {
                  ...httpRequestStep.settings.errorHandlingOptions,
                  continueOnFailure: { value: continueOnFailure },
                  retryOnFailure: { value: retryOnFailure },
                },
              },
            },
          },
        },
      });

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    const createWorkflowResponse = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          mutation CreateWorkflow {
            createWorkflow(data: {
              name: "Continue On Failure Test Workflow"
            }) {
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

    expect(getWorkflowResponse.body.errors).toBeUndefined();
    createdWorkflowVersionId =
      getWorkflowResponse.body.data.workflow.versions.edges[0].node.id;

    const updateTriggerResponse = await updateWorkflowVersionTrigger({
      workflowVersionId: createdWorkflowVersionId!,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });

    expect(updateTriggerResponse.body.errors).toBeUndefined();

    await createStep({ stepType: 'HTTP_REQUEST', parentStepId: 'trigger' });

    const stepsAfterHttpRequestCreation = await getSteps();

    httpRequestStepId =
      stepsAfterHttpRequestCreation.find((step) => step.type === 'HTTP_REQUEST')
        ?.id ?? null;

    expect(httpRequestStepId).not.toBeNull();

    await createStep({ stepType: 'FILTER', parentStepId: httpRequestStepId! });

    const stepsAfterFilterCreation = await getSteps();

    filterStepId =
      stepsAfterFilterCreation.find((step) => step.type === 'FILTER')?.id ??
      null;

    expect(filterStepId).not.toBeNull();
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

  it('should run the next step and complete the run when the failing step continues on failure', async () => {
    await setUpFailingHttpRequestStep({ continueOnFailure: true });

    const workflowRunId = await runWorkflowVersion({
      workflowVersionId: createdWorkflowVersionId!,
    });

    try {
      const workflowRun = await waitForWorkflowCompletion(workflowRunId);

      expect(workflowRun?.status).toBe('COMPLETED');

      const httpRequestStepInfo =
        workflowRun?.state?.stepInfos?.[httpRequestStepId!];

      expect(httpRequestStepInfo?.status).toBe('FAILED_SAFELY');
      expect(httpRequestStepInfo?.error).toBeDefined();
      expect(workflowRun?.state?.stepInfos?.[filterStepId!]?.status).toBe(
        'SUCCESS',
      );
    } finally {
      await destroyWorkflowRun(workflowRunId);
    }
  });

  it('should fail the run and leave the next step not started when the failing step does not continue on failure', async () => {
    await setUpFailingHttpRequestStep({ continueOnFailure: false });

    const workflowRunId = await runWorkflowVersion({
      workflowVersionId: createdWorkflowVersionId!,
    });

    try {
      const workflowRun = await waitForWorkflowCompletion(workflowRunId);

      expect(workflowRun?.status).toBe('FAILED');
      expect(workflowRun?.state?.stepInfos?.[httpRequestStepId!]?.status).toBe(
        'FAILED',
      );
      expect(workflowRun?.state?.stepInfos?.[filterStepId!]?.status).toBe(
        'NOT_STARTED',
      );
    } finally {
      await destroyWorkflowRun(workflowRunId);
    }
  });
  it(
    'should retry the failing step before failing the run when the step retries on failure',
    async () => {
      await setUpFailingHttpRequestStep({
        continueOnFailure: false,
        retryOnFailure: STEP_RETRY_DELAYS_MS.length,
      });

      const workflowRunId = await runWorkflowVersion({
        workflowVersionId: createdWorkflowVersionId!,
      });

      try {
        const workflowRun = await waitForWorkflowCompletion(
          workflowRunId,
          Math.ceil(TOTAL_RETRY_DELAY_MS / 500) + 60,
        );

        expect(workflowRun?.status).toBe('FAILED');

        const httpRequestStepInfo =
          workflowRun?.state?.stepInfos?.[httpRequestStepId!];

        expect(httpRequestStepInfo?.status).toBe('FAILED');
        expect(httpRequestStepInfo?.history).toHaveLength(
          STEP_RETRY_DELAYS_MS.length,
        );
      } finally {
        await destroyWorkflowRun(workflowRunId);
      }
    },
    RETRY_TEST_TIMEOUT_MS,
  );
});
