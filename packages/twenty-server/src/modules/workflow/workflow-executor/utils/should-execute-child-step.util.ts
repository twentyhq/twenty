import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { getEffectiveParentStatus } from 'src/modules/workflow/workflow-executor/utils/get-effective-parent-status.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldExecuteChildStep = ({
  parentSteps,
  childStepId,
  stepInfos,
}: {
  parentSteps: WorkflowAction[];
  childStepId: string;
  stepInfos: WorkflowRunStepInfos;
}) => {
  if (parentSteps.length === 0) {
    return true;
  }

  const statuses = parentSteps.map((parentStep) =>
    getEffectiveParentStatus({ parentStep, childStepId, stepInfos }),
  );

  const hasSuccessfulParentStep = statuses.some(
    (status) => status === StepStatus.SUCCESS,
  );

  const areAllParentsCompleted = statuses.every(
    (status) =>
      status === StepStatus.SUCCESS ||
      status === StepStatus.STOPPED ||
      status === StepStatus.SKIPPED,
  );

  return hasSuccessfulParentStep && areAllParentsCompleted;
};
