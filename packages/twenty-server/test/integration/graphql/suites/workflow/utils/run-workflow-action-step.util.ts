import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionStepInput,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow-test.util';
import { isDefined } from 'twenty-shared/utils';
import {
  destroyWorkflowRun,
  waitForWorkflowCompletion,
  type WorkflowRunStatusType,
} from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';

type WorkflowActionStepType =
  | 'SEND_EMAIL'
  | 'DRAFT_EMAIL'
  | 'SEND_CHAT_MESSAGE'
  | 'CREATE_CALENDAR_EVENT'
  | 'CREATE_RECORD'
  | 'UPDATE_RECORD'
  | 'CODE';

export type WorkflowActionStepRun = {
  status?: WorkflowRunStatusType;
  stepStatus?: string;
  stepResult?: Record<string, unknown>;
  stepError?: string;
};

export const runWorkflowActionStep = async ({
  name,
  stepType,
  input,
  payload,
  runToken,
  beforeRun,
  whileRunning,
}: {
  name: string;
  stepType: WorkflowActionStepType;
  input: Record<string, unknown>;
  payload?: object;
  runToken?: string;
  beforeRun?: () => Promise<unknown>;
  // for a step that waits on a person, who answers here before the run is awaited
  whileRunning?: (run: {
    workflowRunId: string;
    stepId: string;
  }) => Promise<unknown>;
}): Promise<WorkflowActionStepRun> => {
  const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
    name,
  });

  let workflowRunId: string | undefined;

  try {
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

    const step = await createCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      stepType,
    });

    await updateCoreWorkflowVersionStepInput({
      coreWorkflowVersionId,
      step,
      input,
    });

    await beforeRun?.();

    workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId,
      payload,
      token: runToken,
    });

    await whileRunning?.({ workflowRunId, stepId: step.id });

    const workflowRun = await waitForWorkflowCompletion(workflowRunId);
    const stepInfo = workflowRun?.state?.stepInfos?.[step.id];

    return {
      status: workflowRun?.status,
      stepStatus: stepInfo?.status,
      stepResult: stepInfo?.result,
      stepError: stepInfo?.error,
    };
  } finally {
    if (isDefined(workflowRunId)) {
      await destroyWorkflowRun(workflowRunId);
    }

    await deleteCoreWorkflows([coreWorkflowId]);
  }
};
