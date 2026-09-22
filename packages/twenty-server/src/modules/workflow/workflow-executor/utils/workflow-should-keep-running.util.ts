import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
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

  const completedStepWithNotStartedExecutableChildren = steps.some((step) => {
    const status = stepInfos[step.id]?.status;
    if (
      status !== StepStatus.SUCCESS &&
      status !== StepStatus.FAILED_SAFELY &&
      status !== StepStatus.SKIPPED
    ) {
      return false;
    }

    const candidateNextStepIds: string[] = [...(step.nextStepIds ?? [])];
    if (isWorkflowIfElseAction(step)) {
      step.settings.input.branches.forEach((branch) => {
        if (branch.nextStepIds) {
          candidateNextStepIds.push(...branch.nextStepIds);
        }
      });
    }

    return candidateNextStepIds.some((nextStepId) => {
      const nextStep = steps.find(
        (candidateStep) => candidateStep.id === nextStepId,
      );

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
    });
  });

  return (
    runningOrPendingStepExists || completedStepWithNotStartedExecutableChildren
  );
};
