import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { TERMINAL_STEP_STATUSES } from 'src/modules/workflow/workflow-executor/constants/terminal-step-statuses.constant';
import { findChildStepIds } from 'src/modules/workflow/workflow-executor/utils/find-child-step-ids.util';
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

  const terminalStepWithUnresolvedChildrenExists = steps.some((step) => {
    const status = stepInfos[step.id]?.status;

    if (!isDefined(status) || !TERMINAL_STEP_STATUSES.includes(status)) {
      return false;
    }

    return findChildStepIds({ step }).some((childStepId) => {
      if (stepInfos[childStepId]?.status !== StepStatus.NOT_STARTED) {
        return false;
      }

      const childStep = steps.find(
        (candidateStep) => candidateStep.id === childStepId,
      );

      if (!isDefined(childStep)) {
        return false;
      }

      return (
        shouldExecuteStep({
          step: childStep,
          steps,
          stepInfos,
          workflowRunStatus: WorkflowRunStatus.RUNNING,
        }) ||
        shouldSkipStepExecution({ step: childStep, steps, stepInfos }) ||
        shouldFailSafely({ step: childStep, steps, stepInfos })
      );
    });
  });

  return runningOrPendingStepExists || terminalStepWithUnresolvedChildrenExists;
};
