import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

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
    (step) => !stepIdsInLoop.includes(step.id),
  );

  const stepsToCheck = stepHasBeenStarted(step.id, stepInfos)
    ? stepsTargetingIterator
    : parentSteps;

  if (stepsToCheck.length === 0) {
    return true;
  }

  const hasSuccessfulParentStep = stepsToCheck.some(
    (parentStep) => stepInfos[parentStep.id]?.status === StepStatus.SUCCESS,
  );

  const hasFailedNorNotStartedOrRunningParentStep = stepsToCheck.some(
    (parentStep) =>
      stepInfos[parentStep.id]?.status === StepStatus.FAILED ||
      stepInfos[parentStep.id]?.status === StepStatus.NOT_STARTED ||
      stepInfos[parentStep.id]?.status === StepStatus.RUNNING,
  );

  return hasSuccessfulParentStep && !hasFailedNorNotStartedOrRunningParentStep;
};
