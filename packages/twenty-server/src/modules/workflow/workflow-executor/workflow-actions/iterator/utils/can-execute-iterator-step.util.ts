import { isString } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { stepHasBeenStarted } from 'src/modules/workflow/workflow-executor/utils/step-has-been-started.util';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const canExecuteIteratorStep = ({
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

  // If the step has been started, we need to check if all the steps targeting the iterator have been successful.
  if (stepHasBeenStarted(step.id, stepInfos)) {
    return stepsTargetingIterator.every(
      (step) => stepInfos[step.id]?.status === StepStatus.SUCCESS,
    );
  } else {
    // On the first iteration, the loop steps will not have been started yet.
    // TODO: remove parsing once the UI is implemented
    const parsedInitialLoopStepIds = isString(
      step.settings.input.initialLoopStepIds,
    )
      ? JSON.parse(step.settings.input.initialLoopStepIds)
      : step.settings.input.initialLoopStepIds;

    const stepIdsInLoop = getAllStepIdsInLoop({
      iteratorStepId: step.id,
      initialLoopStepIds: parsedInitialLoopStepIds,
      steps,
    });

    const parentSteps = stepsTargetingIterator.filter(
      (step) => !stepIdsInLoop.includes(step.id),
    );

    return parentSteps.every(
      (step) => stepInfos[step.id]?.status === StepStatus.SUCCESS,
    );
  }
};
