import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { TERMINAL_STEP_STATUSES } from 'src/modules/workflow/workflow-executor/constants/terminal-step-statuses.constant';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { shouldFailSafelyIteratorStep } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/should-fail-safely-iterator-step.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldFailSafely = ({
  step,
  steps,
  stepInfos,
}: {
  step: WorkflowAction;
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}): boolean => {
  if (isWorkflowIteratorAction(step)) {
    return shouldFailSafelyIteratorStep({
      step,
      steps,
      stepInfos,
    });
  }

  const parentSteps = steps.filter(
    (parentStep) =>
      isDefined(parentStep) && parentStep.nextStepIds?.includes(step.id),
  );

  if (parentSteps.length === 0) {
    return false;
  }

  const areAllParentsTerminal = parentSteps.every((parentStep) =>
    TERMINAL_STEP_STATUSES.includes(stepInfos[parentStep.id]?.status),
  );

  const hasFailedSafelyParent = parentSteps.some(
    (parentStep) =>
      stepInfos[parentStep.id]?.status === StepStatus.FAILED_SAFELY,
  );

  return areAllParentsTerminal && hasFailedSafelyParent;
};
