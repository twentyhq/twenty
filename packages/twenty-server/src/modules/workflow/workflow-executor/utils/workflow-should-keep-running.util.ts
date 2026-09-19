import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { TERMINAL_STEP_STATUSES } from 'src/modules/workflow/workflow-executor/constants/terminal-step-statuses.constant';
import { findParentSteps } from 'src/modules/workflow/workflow-executor/utils/find-parent-steps.util';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import { shouldFailSafely } from 'src/modules/workflow/workflow-executor/utils/should-fail-safely.util';
import { shouldSkipStepExecution } from 'src/modules/workflow/workflow-executor/utils/should-skip-step-execution.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const workflowShouldKeepRunning = ({
  stepInfos,
  steps,
}: {
  stepInfos: WorkflowRunStepInfos;
  steps: WorkflowAction[];
}) => {
  const runningOrPendingStepExists = steps.some((step) =>
    [StepStatus.PENDING, StepStatus.RUNNING].includes(
      stepInfos[step.id]?.status,
    ),
  );

  const notStartedStepWithPendingWorkExists = steps.some((step) => {
    if (stepInfos[step.id]?.status !== StepStatus.NOT_STARTED) {
      return false;
    }

    const parentSteps = findParentSteps({ step, steps });

    const hasParentStepThatReachedIt = parentSteps.some((parentStep) =>
      TERMINAL_STEP_STATUSES.includes(stepInfos[parentStep.id]?.status),
    );

    if (!hasParentStepThatReachedIt) {
      return false;
    }

    return (
      shouldExecuteStep({
        step,
        steps,
        stepInfos,
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }) ||
      shouldFailSafely({ step, steps, stepInfos }) ||
      shouldSkipStepExecution({ step, steps, stepInfos })
    );
  });

  return runningOrPendingStepExists || notStartedStepWithPendingWorkExists;
};
