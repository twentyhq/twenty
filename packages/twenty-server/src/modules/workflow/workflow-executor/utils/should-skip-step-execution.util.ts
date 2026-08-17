import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { findParentSteps } from 'src/modules/workflow/workflow-executor/utils/find-parent-steps.util';
import { getEffectiveParentStatus } from 'src/modules/workflow/workflow-executor/utils/get-effective-parent-status.util';
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

  const parentSteps = findParentSteps({ step, steps });

  if (parentSteps.length === 0) {
    return false;
  }

  return parentSteps.every((parentStep) => {
    const status = getEffectiveParentStatus({
      parentStep,
      childStepId: step.id,
      stepInfos,
    });

    return (
      status === StepStatus.SKIPPED ||
      status === StepStatus.STOPPED ||
      status === StepStatus.FAILED_SAFELY
    );
  });
};
