import { isDefined } from 'twenty-shared/utils';
import {
  StepStatus,
  WorkflowActionType,
  type WorkflowRunStepInfos,
} from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const FINISHED_STEP_STATUSES: StepStatus[] = [
  StepStatus.SUCCESS,
  StepStatus.SKIPPED,
  StepStatus.FAILED,
  StepStatus.FAILED_SAFELY,
  StepStatus.STOPPED,
];

export const getWorkflowRunStepsThatMayStillExecute = ({
  steps,
  stepInfos,
}: {
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}): WorkflowAction[] => {
  const isFinished = (step: WorkflowAction) => {
    const status = stepInfos[step.id]?.status;

    return isDefined(status) && FINISHED_STEP_STATUSES.includes(status);
  };

  const hasUnfinishedIterator = steps.some(
    (step) => step.type === WorkflowActionType.ITERATOR && !isFinished(step),
  );

  if (hasUnfinishedIterator) {
    return steps;
  }

  return steps.filter((step) => !isFinished(step));
};
