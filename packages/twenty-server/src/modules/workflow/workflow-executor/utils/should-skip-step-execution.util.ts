import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { shouldSkipIteratorStepExecution } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/should-skip-iterator-step-execution.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldSkipStepExecution = ({
  step,
  steps,
  stepInfos,
}: {
  step: WorkflowAction;
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}) => {
  if (isWorkflowIteratorAction(step)) {
    return shouldSkipIteratorStepExecution({
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

  return parentSteps.every(
    (step) =>
      stepInfos[step.id]?.status === StepStatus.SKIPPED ||
      stepInfos[step.id]?.status === StepStatus.STOPPED,
  );
};
