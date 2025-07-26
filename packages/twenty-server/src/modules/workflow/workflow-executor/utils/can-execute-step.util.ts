import { isDefined } from 'twenty-shared/utils';
import { StepStatus, WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

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

  if (
    isDefined(stepInfos[stepId]?.status) &&
    stepInfos[stepId].status !== StepStatus.NOT_STARTED
  ) {
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
