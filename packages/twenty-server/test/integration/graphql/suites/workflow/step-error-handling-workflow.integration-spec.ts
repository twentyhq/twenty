import { STEP_RETRY_DELAYS_MS } from 'twenty-shared/workflow';
import request from 'supertest';
import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

import {
  type WorkflowAction,
  type WorkflowHttpRequestAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const client = request(`http://localhost:${APP_PORT}`);

const BLOCKED_REQUEST_URL = 'http://127.0.0.1:1/';

const TOTAL_RETRY_DELAY_MS = STEP_RETRY_DELAYS_MS.reduce(
  (total, delay) => total + delay,
  0,
);

const RETRY_TEST_TIMEOUT_MS = TOTAL_RETRY_DELAY_MS + 60_000;

describe('Step error handling workflow (e2e)', () => {
  let coreWorkflowId: string | null = null;
  let coreWorkflowVersionId: string | null = null;
  let httpRequestStepId: string | null = null;
  let filterStepId: string | null = null;

  const getSteps = async (): Promise<WorkflowAction[]> => {
    const response = await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `
          query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
            coreWorkflowVersionById(
              coreWorkflowVersionId: $coreWorkflowVersionId
            ) {
              steps
            }
          }
        `,
        variables: { coreWorkflowVersionId },
      });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.coreWorkflowVersionById.steps;
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

    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId: coreWorkflowVersionId!,
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
    });
  };

  beforeAll(async () => {
    const coreWorkflow = await createCoreWorkflow({
      name: 'Continue On Failure Test Workflow',
    });

    coreWorkflowId = coreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = coreWorkflow.coreWorkflowVersionId;

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

    httpRequestStepId = (
      await createCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        stepType: 'HTTP_REQUEST',
      })
    ).id;

    filterStepId = (
      await createCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        stepType: 'FILTER',
        parentStepId: httpRequestStepId,
      })
    ).id;
  });

  afterAll(async () => {
    if (coreWorkflowId) {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    }
  });

  it('should run the next step and complete the run when the failing step continues on failure', async () => {
    await setUpFailingHttpRequestStep({ continueOnFailure: true });

    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: coreWorkflowVersionId!,
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

    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: coreWorkflowVersionId!,
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

      const workflowRunId = await runCoreWorkflowVersion({
        coreWorkflowVersionId: coreWorkflowVersionId!,
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
