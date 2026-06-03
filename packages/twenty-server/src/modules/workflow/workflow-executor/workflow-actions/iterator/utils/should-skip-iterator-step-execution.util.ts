import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { findParentSteps } from 'src/modules/workflow/workflow-executor/utils/find-parent-steps.util';
import { stepHasBeenStarted } from 'src/modules/workflow/workflow-executor/utils/step-has-been-started.util';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldSkipIteratorStepExecution = ({
  step,
  steps,
  stepInfos,
}: {
  step: WorkflowIteratorAction;
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}) => {
  const allParentSteps = findParentSteps({ step, steps });

  const initialLoopStepIds = step.settings.input.initialLoopStepIds;

  const stepIdsInLoop = isDefined(initialLoopStepIds)
    ? getAllStepIdsInLoop({
        iteratorStepId: step.id,
        initialLoopStepIds,
        steps,
      })
    : [];

  const parentSteps = allParentSteps.filter(
    (parentStep) => !stepIdsInLoop.includes(parentStep.id),
  );

  if (stepHasBeenStarted(step.id, stepInfos) || parentSteps.length === 0) {
    return false;
  }

  return parentSteps.every(
    (parentStep) =>
      stepInfos[parentStep.id]?.status === StepStatus.SKIPPED ||
      stepInfos[parentStep.id]?.status === StepStatus.STOPPED ||
      stepInfos[parentStep.id]?.status === StepStatus.FAILED_SAFELY,
  );
};
