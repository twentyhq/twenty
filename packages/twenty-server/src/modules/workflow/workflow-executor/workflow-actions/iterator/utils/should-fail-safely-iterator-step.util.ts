import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { TERMINAL_STEP_STATUSES } from 'src/modules/workflow/workflow-executor/constants/terminal-step-statuses.constant';
import { findParentSteps } from 'src/modules/workflow/workflow-executor/utils/find-parent-steps.util';
import { stepHasBeenStarted } from 'src/modules/workflow/workflow-executor/utils/step-has-been-started.util';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldFailSafelyIteratorStep = ({
  step,
  steps,
  stepInfos,
}: {
  step: WorkflowIteratorAction;
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}): boolean => {
  const allParentSteps = findParentSteps({ step, steps });

  const initialLoopStepIds = step.settings.input.initialLoopStepIds;

  const stepIdsInLoop = isDefined(initialLoopStepIds)
    ? getAllStepIdsInLoop({
        iteratorStepId: step.id,
        initialLoopStepIds,
        steps,
      })
    : [];

  const externalParentSteps = allParentSteps.filter(
    (parentStep) => !stepIdsInLoop.includes(parentStep.id),
  );

  if (!stepHasBeenStarted(step.id, stepInfos)) {
    if (externalParentSteps.length === 0) {
      return false;
    }

    const areAllExternalParentsTerminal = externalParentSteps.every(
      (parentStep) =>
        TERMINAL_STEP_STATUSES.includes(stepInfos[parentStep.id]?.status),
    );

    const hasFailedSafelyExternalParent = externalParentSteps.some(
      (parentStep) =>
        stepInfos[parentStep.id]?.status === StepStatus.FAILED_SAFELY,
    );

    return areAllExternalParentsTerminal && hasFailedSafelyExternalParent;
  }

  const areAllParentsTerminal = allParentSteps.every((parentStep) =>
    TERMINAL_STEP_STATUSES.includes(stepInfos[parentStep.id]?.status),
  );

  if (!areAllParentsTerminal) {
    return false;
  }

  const hasFailedSafelyParent = allParentSteps.some(
    (parentStep) =>
      stepInfos[parentStep.id]?.status === StepStatus.FAILED_SAFELY,
  );

  if (!hasFailedSafelyParent) {
    return false;
  }

  // If the iterator has the flag, check whether the failure originated from
  // its own loop. If yes, the iterator handles it (re-execute) — not fail safely.
  if (step.settings.input.shouldContinueOnIterationFailure) {
    const hasFailureFromOwnLoop = stepIdsInLoop.some(
      (loopStepId) =>
        stepInfos[loopStepId]?.status === StepStatus.FAILED_SAFELY &&
        isDefined(stepInfos[loopStepId]?.error),
    );

    if (hasFailureFromOwnLoop) {
      return false;
    }
  }

  return true;
};
