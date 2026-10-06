import { STEP_RETRY_DELAYS_MS } from 'twenty-shared/workflow';
import { isDefined } from 'twenty-shared/utils';
import {
  CORE_WORKFLOW_MANUAL_TRIGGER,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersionById,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

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

  const setUpFailingHttpRequestStep = async ({
    continueOnFailure,
    retryOnFailure = 0,
  }: {
    continueOnFailure: boolean;
    retryOnFailure?: number;
  }) => {
    const coreWorkflowVersion = await findCoreWorkflowVersionById(
      coreWorkflowVersionId!,
    );

    const httpRequestStep = coreWorkflowVersion?.steps?.find(
      (step) => step.id === httpRequestStepId,
    );

    if (!isDefined(httpRequestStep)) {
      throw new Error(`HTTP request step ${httpRequestStepId} not found`);
    }

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
            continueOnFailure: { value: continueOnFailure },
            retryOnFailure: { value: retryOnFailure },
          },
        },
      },
    });
  };

  beforeAll(async () => {
    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Continue On Failure Test Workflow',
    });

    coreWorkflowId = createdCoreWorkflow.coreWorkflowId;
    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: CORE_WORKFLOW_MANUAL_TRIGGER,
    });

    const httpRequestStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'HTTP_REQUEST',
    });

    httpRequestStepId = httpRequestStep.id;

    const filterStep = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType: 'FILTER',
      parentStepId: httpRequestStep.id,
    });

    filterStepId = filterStep.id;
  });

  afterAll(async () => {
    if (isDefined(coreWorkflowId)) {
      await deleteCoreWorkflows([coreWorkflowId]);
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
