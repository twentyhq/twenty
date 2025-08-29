import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const stepHasBeenStarted = (
  stepId: string,
  stepInfos: WorkflowRunStepInfos,
) => {
  return (
    isDefined(stepInfos[stepId]?.status) &&
    stepInfos[stepId].status !== StepStatus.NOT_STARTED
  );
};

const isIteratorStep = (step: WorkflowAction) => {
  return step.type === WorkflowActionType.ITERATOR;
};

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

  if (stepHasBeenStarted(stepId, stepInfos) && !isIteratorStep(step)) {
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
