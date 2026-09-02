import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { stepShouldContinueOnFailure } from 'src/modules/workflow/workflow-executor/utils/step-should-continue-on-failure.util';
import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// FAILED_SAFELY set by cascade carries no error: only a step that ran and failed
// on its own hands execution over to its children, and a failed if/else has no
// matching branch to hand it over to.
export const stepFailedAndContinued = ({
  step,
  stepInfos,
}: {
  step: WorkflowAction;
  stepInfos: WorkflowRunStepInfos;
}): boolean => {
  if (isWorkflowIfElseAction(step)) {
    return false;
  }

  const stepInfo = stepInfos[step.id];

  return (
    stepInfo?.status === StepStatus.FAILED_SAFELY &&
    isDefined(stepInfo?.error) &&
    stepShouldContinueOnFailure(step)
  );
};
