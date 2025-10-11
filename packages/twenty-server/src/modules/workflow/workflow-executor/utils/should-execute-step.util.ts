import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { stepHasBeenStarted } from 'src/modules/workflow/workflow-executor/utils/step-has-been-started.util';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { shouldExecuteIteratorStep } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/should-execute-iterator-step.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldExecuteStep = ({
  step,
  steps,
  stepInfos,
  workflowRunStatus,
}: {
  step: WorkflowAction;
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
  workflowRunStatus: WorkflowRunStatus;
}) => {
  if (workflowRunStatus !== WorkflowRunStatus.RUNNING) {
    return false;
  }

  if (isWorkflowIteratorAction(step)) {
    return shouldExecuteIteratorStep({
      step,
      steps,
      stepInfos,
    });
  }

  if (stepHasBeenStarted(step.id, stepInfos)) {
    return false;
  }

  const parentSteps = steps.filter(
    (parentStep) =>
      isDefined(parentStep) && parentStep.nextStepIds?.includes(step.id),
  );

  if (parentSteps.length === 0) {
    return true;
  }

  const hasSuccessfulParentStep = parentSteps.some(
    (parentStep) => stepInfos[parentStep.id]?.status === StepStatus.SUCCESS,
  );

  const areAllParentsCompleted = parentSteps.every(
    (parentStep) =>
      stepInfos[parentStep.id]?.status === StepStatus.SUCCESS ||
      stepInfos[parentStep.id]?.status === StepStatus.STOPPED ||
      stepInfos[parentStep.id]?.status === StepStatus.SKIPPED,
  );

  return hasSuccessfulParentStep && areAllParentsCompleted;
};
