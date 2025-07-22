import { StepStatus, WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { canExecuteStep } from 'src/modules/workflow/workflow-executor/utils/can-execute-step.util';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

export const workflowShouldKeepRunning = ({
  stepInfos,
  steps,
}: {
  stepInfos: WorkflowRunStepInfos;
  steps: WorkflowAction[];
}) => {
  const runningOrPendingStepExists = steps.some((step) =>
    [StepStatus.PENDING, StepStatus.RUNNING].includes(
      stepInfos[step.id]?.status,
    ),
  );

  const successStepWithNotStartedExecutableChildren = steps.some(
    (step) =>
      stepInfos[step.id]?.status === StepStatus.SUCCESS &&
      (step.nextStepIds ?? []).some(
        (nextStepId) =>
          stepInfos[nextStepId]?.status === StepStatus.NOT_STARTED &&
          canExecuteStep({
            stepId: nextStepId,
            steps,
            stepInfos,
            workflowRunStatus: WorkflowRunStatus.RUNNING,
          }),
      ),
  );

  return (
    runningOrPendingStepExists || successStepWithNotStartedExecutableChildren
  );
};
