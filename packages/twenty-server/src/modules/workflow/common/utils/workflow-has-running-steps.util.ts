import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const workflowHasRunningSteps = ({
  stepInfos,
  steps,
}: {
  stepInfos: WorkflowRunStepInfos;
  steps: WorkflowAction[];
}) => {
  return steps.some(
    (step) => stepInfos[step.id]?.status === StepStatus.RUNNING,
  );
};
