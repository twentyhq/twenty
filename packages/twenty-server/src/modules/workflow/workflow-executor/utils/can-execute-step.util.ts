import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { stepHasBeenStarted } from 'src/modules/workflow/workflow-executor/utils/step-has-been-started.util';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { canExecuteIteratorStep } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/can-execute-iterator-step.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const canExecuteStep = ({
  stepId,
  steps,
  stepInfos,
  workflowRunStatus,
}: {
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
  stepId: string;
  workflowRunStatus: WorkflowRunStatus;
}) => {
  if (workflowRunStatus !== WorkflowRunStatus.RUNNING) {
    return false;
  }

  const step = steps.find((step) => step.id === stepId);

  if (!step) {
    return false;
  }

  if (isWorkflowIteratorAction(step)) {
    return canExecuteIteratorStep({
      step,
      steps,
      stepInfos,
    });
  }

  if (stepHasBeenStarted(stepId, stepInfos)) {
    return false;
  }

  const parentSteps = steps.filter(
    (parentStep) =>
      isDefined(parentStep) && parentStep.nextStepIds?.includes(stepId),
  );

  return parentSteps.every(
    (parentStep) => stepInfos[parentStep.id]?.status === StepStatus.SUCCESS,
  );
};
