import { STEP_RETRY_DELAYS_MS } from 'twenty-shared/workflow';
import request from 'supertest';

import {
  destroyWorkflowRun,
  getWorkflowRun,
  runWorkflowVersion,
  waitForWorkflowCompletion,
  type WorkflowRunResponse,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { updateWorkflowVersionTrigger } from 'test/integration/graphql/suites/workflow/utils/update-workflow-version-trigger.util';

// Do not import/extend run-workflow-action-step.util.ts or its
// WorkflowActionStepType union here (D-03) - RUN_WORKFLOW's two-workflow
// (parent + child) shape doesn't fit that single-workflow-action-step util,
// so this file hand-rolls its own local scaffolding helpers below, mirroring
// the same GraphQL-mutation shapes for pattern fidelity only.

const client = request(`http://localhost:${APP_PORT}`);

// Same blocked-URL constant used by step-error-handling-workflow.integration-spec.ts:17
// - connecting to a closed local port fails fast (ECONNREFUSED) and
// deterministically, giving reliable retry/stop-window timing. Shared by the
// stop-parity fixture above and the 'retry parity' describe block below.
const BLOCKED_REQUEST_URL = 'http://127.0.0.1:1/';

const TOTAL_RETRY_DELAY_MS = STEP_RETRY_DELAYS_MS.reduce(
  (total, delay) => total + delay,
  0,
);

const RETRY_TEST_TIMEOUT_MS = TOTAL_RETRY_DELAY_MS + 60_000;

const MANUAL_TRIGGER = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

type WorkflowVersionStep = {
  id: string;
  type: string;
  settings: {
    input: Record<string, unknown>;
    errorHandlingOptions?: {
      retryOnFailure: { value: number };
      continueOnFailure: { value: boolean };
    };
  };
};

const createWorkflow = async (name: string): Promise<string> => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation CreateWorkflow($name: String!) {
          createWorkflow(data: { name: $name }) {
            id
          }
        }
      `,
      variables: { name },
    });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createWorkflow.id;
};

const destroyWorkflow = async (workflowId: string): Promise<void> => {
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
      variables: { id: workflowId },
    });
};

const findDraftWorkflowVersionId = async (
  workflowId: string,
): Promise<string> => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        query FindDraftWorkflowVersion($workflowId: UUID!) {
          workflowVersions(
            filter: { workflowId: { eq: $workflowId }, status: { in: ["DRAFT"] } }
          ) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
      variables: { workflowId },
    });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.workflowVersions.edges[0].node.id;
};

const createWorkflowVersionStep = async ({
  workflowVersionId,
  stepType,
  parentStepId,
}: {
  workflowVersionId: string;
  stepType: string;
  parentStepId: string;
}): Promise<void> => {
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
          workflowVersionId,
          stepType,
          parentStepId,
          position: { x: 200, y: 0 },
        },
      },
    });

  expect(response.body.errors).toBeUndefined();
};

const findWorkflowVersionStep = async ({
  workflowVersionId,
  stepType,
}: {
  workflowVersionId: string;
  stepType: string;
}): Promise<WorkflowVersionStep> => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        query FindWorkflowVersionSteps($workflowVersionId: UUID!) {
          workflowVersion(filter: { id: { eq: $workflowVersionId } }) {
            steps
          }
        }
      `,
      variables: { workflowVersionId },
    });

  expect(response.body.errors).toBeUndefined();

  const step = response.body.data.workflowVersion.steps.find(
    (workflowVersionStep: WorkflowVersionStep) =>
      workflowVersionStep.type === stepType,
  );

  expect(step).toBeDefined();

  return step;
};

const activateWorkflowVersion = async (
  workflowVersionId: string,
): Promise<void> => {
  const response = await client
    .post('/graphql')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .send({
      query: `
        mutation ActivateWorkflowVersion($workflowVersionId: UUID!) {
          activateWorkflowVersion(workflowVersionId: $workflowVersionId)
        }
      `,
      variables: { workflowVersionId },
    });

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.activateWorkflowVersion).toBe(true);
};

// RUN_WORKFLOW's settings.input is a structured `{ workflowId, input }` object
// (WorkflowRunWorkflowActionInput), not a flat bag merged onto whatever is
// already there like other action steps - so it must be replaced wholesale,
// not spread onto the existing settings.input as the generic
// updateWorkflowVersionStepInput helper in run-workflow-action-step.util.ts does.
const setRunWorkflowStepInput = async ({
  workflowVersionId,
  step,
  workflowId,
  input,
}: {
  workflowVersionId: string;
  step: WorkflowVersionStep;
  workflowId: string;
  input: Record<string, unknown>;
}): Promise<void> => {
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
          workflowVersionId,
          step: {
            ...step,
            settings: {
              ...step.settings,
              input: { workflowId, input },
            },
          },
        },
      },
    });

  expect(response.body.errors).toBeUndefined();
};

// Reused (not redeclared) by the 'retry parity' describe block added in
// Task 2 - both need a child workflow with one real HTTP_REQUEST step
// pointed at a URL that fails fast and deterministically, with a
// configurable retry count.
const configureBlockedHttpRequestStep = async ({
  workflowVersionId,
  step,
  retryOnFailure,
}: {
  workflowVersionId: string;
  step: WorkflowVersionStep;
  retryOnFailure: number;
}): Promise<void> => {
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
          workflowVersionId,
          step: {
            ...step,
            settings: {
              ...step.settings,
              input: {
                ...step.settings.input,
                url: BLOCKED_REQUEST_URL,
              },
              errorHandlingOptions: {
                ...step.settings.errorHandlingOptions,
                continueOnFailure: { value: false },
                retryOnFailure: { value: retryOnFailure },
              },
            },
          },
        },
      },
    });

  expect(response.body.errors).toBeUndefined();
};

describe('Run workflow action - integration (e2e)', () => {
  let childWorkflowId: string;
  let childPublishedVersionId: string;
  let parentWorkflowId: string;
  let parentVersionId: string;
  let runWorkflowStepId: string;

  beforeAll(async () => {
    // Shared linkage fixture: a bare, trigger-only child - no real work
    // needed here since this pair is only used by the linkage test below,
    // not the stop-parity test (which needs its own dedicated, non-trivial
    // fixture - see the nested 'stop parity' describe block).
    childWorkflowId = await createWorkflow('RUN_WORKFLOW Test - Child');

    const childDraftVersionId =
      await findDraftWorkflowVersionId(childWorkflowId);

    await updateWorkflowVersionTrigger({
      workflowVersionId: childDraftVersionId,
      trigger: MANUAL_TRIGGER,
    });

    // A version needs at least one step to be activated
    // (assert-version-can-be-activated.util.ts) - EMPTY is a genuine no-op
    // action (always resolves with an empty result), so it satisfies that
    // requirement without introducing any real side effect or config.
    await createWorkflowVersionStep({
      workflowVersionId: childDraftVersionId,
      stepType: 'EMPTY',
      parentStepId: 'trigger',
    });

    await activateWorkflowVersion(childDraftVersionId);
    childPublishedVersionId = childDraftVersionId;

    parentWorkflowId = await createWorkflow('RUN_WORKFLOW Test - Parent');
    // The parent is triggered directly from its draft version, matching
    // step-error-handling-workflow.integration-spec.ts and
    // run-workflow-action-step.util.ts - it is never activated.
    parentVersionId = await findDraftWorkflowVersionId(parentWorkflowId);

    await updateWorkflowVersionTrigger({
      workflowVersionId: parentVersionId,
      trigger: MANUAL_TRIGGER,
    });

    await createWorkflowVersionStep({
      workflowVersionId: parentVersionId,
      stepType: 'RUN_WORKFLOW',
      parentStepId: 'trigger',
    });

    const runWorkflowStep = await findWorkflowVersionStep({
      workflowVersionId: parentVersionId,
      stepType: 'RUN_WORKFLOW',
    });

    runWorkflowStepId = runWorkflowStep.id;

    await setRunWorkflowStepInput({
      workflowVersionId: parentVersionId,
      step: runWorkflowStep,
      workflowId: childWorkflowId,
      input: {},
    });
  });

  afterAll(async () => {
    // Workflow runs are destroyed per-test in finally blocks (D-04); only
    // the workflow records themselves are torn down here.
    await destroyWorkflow(parentWorkflowId);
    await destroyWorkflow(childWorkflowId);
  });

  it('creates a real child workflowRun, linked only via the parent step result.workflowRunId (D-02)', async () => {
    const parentRunId = await runWorkflowVersion({
      workflowVersionId: parentVersionId,
    });

    let childRunId: string | undefined;

    try {
      const parentRun = await waitForWorkflowCompletion(parentRunId);

      expect(parentRun?.status).toBe('COMPLETED');

      // The only correlation mechanism per D-02 - no entity link, no
      // callee run-list scan, just the workflowRunId the action returns in
      // its own step result.
      childRunId = parentRun?.state?.stepInfos?.[runWorkflowStepId]?.result
        ?.workflowRunId as string | undefined;

      expect(typeof childRunId).toBe('string');

      const childRun = await getWorkflowRun(childRunId as string);

      expect(childRun).not.toBeNull();
      expect(childRun?.workflowVersionId).toBe(childPublishedVersionId);

      const completedChildRun = await waitForWorkflowCompletion(
        childRunId as string,
      );

      expect(completedChildRun?.status).toBe('COMPLETED');
    } finally {
      // Child first, then parent, per D-04's ordering.
      if (childRunId) {
        await destroyWorkflowRun(childRunId);
      }
      await destroyWorkflowRun(parentRunId);
    }
  });

  describe('stop parity', () => {
    // Dedicated fixture pair, not the shared linkage pair above - reusing
    // the bare trigger-only child risks a flaky race, since a no-op child
    // can transition ENQUEUED -> COMPLETED before the stop mutation lands.
    // Giving this child one real HTTP_REQUEST step guarantees genuine
    // queue-processing runtime, mirroring why quick-lead-workflow's stop
    // test works reliably against a workflow with real step bodies.
    let stoppableChildWorkflowId: string;
    let stopParentWorkflowId: string;
    let stopParentVersionId: string;
    let stopRunWorkflowStepId: string;

    beforeAll(async () => {
      stoppableChildWorkflowId = await createWorkflow(
        'RUN_WORKFLOW Test - Stoppable Child',
      );

      const stoppableChildDraftVersionId = await findDraftWorkflowVersionId(
        stoppableChildWorkflowId,
      );

      await updateWorkflowVersionTrigger({
        workflowVersionId: stoppableChildDraftVersionId,
        trigger: MANUAL_TRIGGER,
      });

      await createWorkflowVersionStep({
        workflowVersionId: stoppableChildDraftVersionId,
        stepType: 'HTTP_REQUEST',
        parentStepId: 'trigger',
      });

      const httpRequestStep = await findWorkflowVersionStep({
        workflowVersionId: stoppableChildDraftVersionId,
        stepType: 'HTTP_REQUEST',
      });

      // One retry is enough to guarantee the run stays in a genuine
      // pre-terminal (ENQUEUED/RUNNING) state for at least one real
      // queue-processing tick before it would naturally fail, giving the
      // stop mutation a real window to land.
      await configureBlockedHttpRequestStep({
        workflowVersionId: stoppableChildDraftVersionId,
        step: httpRequestStep,
        retryOnFailure: 1,
      });

      await activateWorkflowVersion(stoppableChildDraftVersionId);

      stopParentWorkflowId = await createWorkflow(
        'RUN_WORKFLOW Test - Stop Parent',
      );
      stopParentVersionId = await findDraftWorkflowVersionId(
        stopParentWorkflowId,
      );

      await updateWorkflowVersionTrigger({
        workflowVersionId: stopParentVersionId,
        trigger: MANUAL_TRIGGER,
      });

      await createWorkflowVersionStep({
        workflowVersionId: stopParentVersionId,
        stepType: 'RUN_WORKFLOW',
        parentStepId: 'trigger',
      });

      const stopRunWorkflowStep = await findWorkflowVersionStep({
        workflowVersionId: stopParentVersionId,
        stepType: 'RUN_WORKFLOW',
      });

      stopRunWorkflowStepId = stopRunWorkflowStep.id;

      await setRunWorkflowStepInput({
        workflowVersionId: stopParentVersionId,
        step: stopRunWorkflowStep,
        workflowId: stoppableChildWorkflowId,
        input: {},
      });
    });

    afterAll(async () => {
      await destroyWorkflow(stopParentWorkflowId);
      await destroyWorkflow(stoppableChildWorkflowId);
    });

    it('stops the child workflowRun exactly as any independently-triggered run, proving throttle-path parity', async () => {
      const parentRunId = await runWorkflowVersion({
        workflowVersionId: stopParentVersionId,
      });

      let childRunId: string | undefined;

      try {
        // Poll until the RUN_WORKFLOW step itself resolves - it is
        // synchronous once it has enqueued the child
        // (run-workflow.workflow-action.ts:191-208) - so childRunId is
        // extracted as soon as it's available.
        let attempts = 0;
        let parentRun: WorkflowRunResponse | null = null;

        while (attempts < 30) {
          parentRun = await getWorkflowRun(parentRunId);

          if (
            parentRun?.state?.stepInfos?.[stopRunWorkflowStepId]?.status ===
            'SUCCESS'
          ) {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }

        childRunId = parentRun?.state?.stepInfos?.[stopRunWorkflowStepId]
          ?.result?.workflowRunId as string | undefined;

        expect(typeof childRunId).toBe('string');

        const childRunBeforeStop = await getWorkflowRun(
          childRunId as string,
        );

        // Architectural-equivalence interpretation of D-01's throttle-parity
        // clause: this asserts the child run passes through the same
        // queue-observable pre-terminal states (ENQUEUED/RUNNING) any other
        // run does, via the same WorkflowRunnerWorkspaceService.run() entry
        // point every trigger path uses (run-workflow.workflow-action.ts:196-206)
        // - NOT an empirical/functional test of
        // workflow-throttling.workspace-service.ts's token-bucket limiter
        // under saturation. No throttle-saturation test exists anywhere in
        // this repo as precedent (04-PATTERNS.md "No Analog Found"), so none
        // is added here; read this as proof of identical code-path travel,
        // not proof the throttle behaves correctly under contention.
        expect(['ENQUEUED', 'RUNNING']).toContain(
          childRunBeforeStop?.status,
        );

        const stopResponse = await client
          .post('/graphql')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send({
            query: `
              mutation StopWorkflowRun($workflowRunId: UUID!) {
                stopWorkflowRun(workflowRunId: $workflowRunId) {
                  id
                  status
                }
              }
            `,
            variables: { workflowRunId: childRunId },
          });

        expect(stopResponse.body.errors).toBeUndefined();
        expect(stopResponse.body.data.stopWorkflowRun.status).toBe(
          'STOPPED',
        );

        const stoppedChildRun = await getWorkflowRun(childRunId as string);

        expect(stoppedChildRun?.status).toBe('STOPPED');
      } finally {
        if (childRunId) {
          await destroyWorkflowRun(childRunId);
        }
        await destroyWorkflowRun(parentRunId);
      }
    });
  });

  describe('retry parity', () => {
    // Separate, self-contained fixture pair - does not reuse or mutate the
    // shared linkage fixtures above, nor the stop-parity fixtures.
    let failingChildWorkflowId: string;
    let httpRequestStepId: string;
    let retryParentWorkflowId: string;
    let retryParentVersionId: string;
    let retryRunWorkflowStepId: string;

    beforeAll(async () => {
      failingChildWorkflowId = await createWorkflow(
        'RUN_WORKFLOW Test - Failing Child',
      );

      const failingChildVersionId = await findDraftWorkflowVersionId(
        failingChildWorkflowId,
      );

      await updateWorkflowVersionTrigger({
        workflowVersionId: failingChildVersionId,
        trigger: MANUAL_TRIGGER,
      });

      await createWorkflowVersionStep({
        workflowVersionId: failingChildVersionId,
        stepType: 'HTTP_REQUEST',
        parentStepId: 'trigger',
      });

      const httpRequestStep = await findWorkflowVersionStep({
        workflowVersionId: failingChildVersionId,
        stepType: 'HTTP_REQUEST',
      });

      httpRequestStepId = httpRequestStep.id;

      await configureBlockedHttpRequestStep({
        workflowVersionId: failingChildVersionId,
        step: httpRequestStep,
        retryOnFailure: STEP_RETRY_DELAYS_MS.length,
      });

      await activateWorkflowVersion(failingChildVersionId);

      retryParentWorkflowId = await createWorkflow(
        'RUN_WORKFLOW Test - Retry Parent',
      );
      retryParentVersionId = await findDraftWorkflowVersionId(
        retryParentWorkflowId,
      );

      await updateWorkflowVersionTrigger({
        workflowVersionId: retryParentVersionId,
        trigger: MANUAL_TRIGGER,
      });

      await createWorkflowVersionStep({
        workflowVersionId: retryParentVersionId,
        stepType: 'RUN_WORKFLOW',
        parentStepId: 'trigger',
      });

      const runWorkflowStep = await findWorkflowVersionStep({
        workflowVersionId: retryParentVersionId,
        stepType: 'RUN_WORKFLOW',
      });

      retryRunWorkflowStepId = runWorkflowStep.id;

      // The parent step's own errorHandlingOptions is left at defaults -
      // the parent's RUN_WORKFLOW step itself resolves synchronously and is
      // not what is being retried here; the child's own HTTP_REQUEST step
      // is.
      await setRunWorkflowStepInput({
        workflowVersionId: retryParentVersionId,
        step: runWorkflowStep,
        workflowId: failingChildWorkflowId,
        input: {},
      });
    });

    afterAll(async () => {
      await destroyWorkflow(retryParentWorkflowId);
      await destroyWorkflow(failingChildWorkflowId);
    });

    it(
      'retries the failing child step and fails the child run exactly like any independently-triggered run',
      async () => {
        const parentRunId = await runWorkflowVersion({
          workflowVersionId: retryParentVersionId,
        });

        let childRunId: string | undefined;

        try {
          // The RUN_WORKFLOW step itself still succeeds - it only starts
          // the child, it does not wait on it.
          const parentRun = await waitForWorkflowCompletion(parentRunId);

          childRunId = parentRun?.state?.stepInfos?.[retryRunWorkflowStepId]
            ?.result?.workflowRunId as string | undefined;

          expect(typeof childRunId).toBe('string');

          const childRun = await waitForWorkflowCompletion(
            childRunId as string,
            Math.ceil(TOTAL_RETRY_DELAY_MS / 500) + 60,
          );

          // Proves the CHILD run's own retry mechanics are indistinguishable
          // from step-error-handling-workflow.integration-spec.ts's
          // directly-triggered case.
          expect(childRun?.status).toBe('FAILED');
          expect(
            childRun?.state?.stepInfos?.[httpRequestStepId]?.status,
          ).toBe('FAILED');
          expect(
            childRun?.state?.stepInfos?.[httpRequestStepId]?.history,
          ).toHaveLength(STEP_RETRY_DELAYS_MS.length);
        } finally {
          if (childRunId) {
            await destroyWorkflowRun(childRunId);
          }
          await destroyWorkflowRun(parentRunId);
        }
      },
      RETRY_TEST_TIMEOUT_MS,
    );
  });
});
