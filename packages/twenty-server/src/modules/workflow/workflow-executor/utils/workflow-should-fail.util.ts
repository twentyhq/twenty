import { StepStatus, WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const workflowShouldFail = ({
  stepInfos,
  steps,
}: {
  stepInfos: WorkflowRunStepInfos;
  steps: WorkflowAction[];
}) => {
  const failedSteps = steps.filter(
    (step) => stepInfos[step.id]?.status === StepStatus.FAILED,
  );

  return failedSteps.length > 0;
};
