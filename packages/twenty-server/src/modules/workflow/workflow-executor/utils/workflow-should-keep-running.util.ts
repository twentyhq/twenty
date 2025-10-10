import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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
      (step.nextStepIds ?? []).some((nextStepId) => {
        const nextStep = steps.find((step) => step.id === nextStepId);

        if (!nextStep) {
          return false;
        }

        return (
          stepInfos[nextStepId]?.status === StepStatus.NOT_STARTED &&
          shouldExecuteStep({
            step: nextStep,
            steps,
            stepInfos,
            workflowRunStatus: WorkflowRunStatus.RUNNING,
          })
        );
      }),
  );

  return (
    runningOrPendingStepExists || successStepWithNotStartedExecutableChildren
  );
};
