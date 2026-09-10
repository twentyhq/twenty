import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { TERMINAL_STEP_STATUSES } from 'src/modules/workflow/workflow-executor/constants/terminal-step-statuses.constant';
import { findParentSteps } from 'src/modules/workflow/workflow-executor/utils/find-parent-steps.util';
import { getEffectiveParentStatus } from 'src/modules/workflow/workflow-executor/utils/get-effective-parent-status.util';
import { stepFailedAndContinued } from 'src/modules/workflow/workflow-executor/utils/step-failed-and-continued.util';
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

  const parentSteps = findParentSteps({ step, steps });

  if (parentSteps.length === 0) {
    return false;
  }

  const parentOutcomes = parentSteps.map((parentStep) => ({
    status: getEffectiveParentStatus({
      parentStep,
      childStepId: step.id,
      stepInfos,
    }),
    failedAndContinued: stepFailedAndContinued({ step: parentStep, stepInfos }),
  }));

  const areAllParentsTerminal = parentOutcomes.every(
    ({ status }) =>
      isDefined(status) && TERMINAL_STEP_STATUSES.includes(status),
  );

  const hasFailedSafelyParent = parentOutcomes.some(
    ({ status, failedAndContinued }) =>
      status === StepStatus.FAILED_SAFELY && !failedAndContinued,
  );

  return areAllParentsTerminal && hasFailedSafelyParent;
};
