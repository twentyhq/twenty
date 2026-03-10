import {
  StepStatus,
  type WorkflowRunStepInfo,
  type WorkflowRunStepInfos,
} from 'twenty-shared/workflow';

import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const setAllIteratorsStepInfosAsStopped = ({
  stepInfos,
  steps,
}: {
  stepInfos: WorkflowRunStepInfos;
  steps: WorkflowAction[];
}): Record<string, WorkflowRunStepInfo> => {
  const stoppedStepInfos: Record<string, WorkflowRunStepInfo> = {};

  for (const step of steps) {
    if (
      stepInfos[step.id]?.status === StepStatus.RUNNING &&
      isWorkflowIteratorAction(step)
    ) {
      stoppedStepInfos[step.id] = {
        ...stepInfos[step.id],
        status: StepStatus.STOPPED,
      };
    }
  }

  return stoppedStepInfos;
};
