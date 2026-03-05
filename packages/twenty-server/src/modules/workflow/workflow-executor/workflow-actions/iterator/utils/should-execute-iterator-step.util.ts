import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { TERMINAL_STEP_STATUSES } from 'src/modules/workflow/workflow-executor/constants/terminal-step-statuses.constant';
import { shouldExecuteChildStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-child-step.util';
import { stepHasBeenStarted } from 'src/modules/workflow/workflow-executor/utils/step-has-been-started.util';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldExecuteIteratorStep = ({
  step,
  steps,
  stepInfos,
}: {
  step: WorkflowIteratorAction;
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}) => {
  const stepsTargetingIterator = steps.filter(
    (parentStep) =>
      isDefined(parentStep) && parentStep.nextStepIds?.includes(step.id),
  );

  const initialLoopStepIds = step.settings.input.initialLoopStepIds;

  const stepIdsInLoop = isDefined(initialLoopStepIds)
    ? getAllStepIdsInLoop({
        iteratorStepId: step.id,
        initialLoopStepIds,
        steps,
      })
    : [];

  const parentSteps = stepsTargetingIterator.filter(
    (parentStep) => !stepIdsInLoop.includes(parentStep.id),
  );

  const stepsToCheck = stepHasBeenStarted(step.id, stepInfos)
    ? stepsTargetingIterator
    : parentSteps;

  // When iterator has been started and has the continue-on-failure flag,
  // allow re-execution even if all loop-back parents are FAILED_SAFELY/SKIPPED
  // (i.e. don't require at least one SUCCESS parent)
  if (
    stepHasBeenStarted(step.id, stepInfos) &&
    step.settings.input.shouldContinueOnIterationFailure
  ) {
    const hasFailureFromOwnLoop = stepIdsInLoop.some(
      (loopStepId) =>
        stepInfos[loopStepId]?.status === StepStatus.FAILED_SAFELY &&
        isDefined(stepInfos[loopStepId]?.error),
    );

    if (hasFailureFromOwnLoop) {
      const areAllParentsTerminal = stepsToCheck.every((parentStep) =>
        TERMINAL_STEP_STATUSES.includes(stepInfos[parentStep.id]?.status),
      );

      return areAllParentsTerminal;
    }
  }

  return shouldExecuteChildStep({
    parentSteps: stepsToCheck,
    stepInfos,
  });
};
