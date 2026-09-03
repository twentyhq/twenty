import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { STEP_RETRY_DELAYS_MS } from 'src/modules/workflow/workflow-executor/constants/step-retry-delays.constant';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Only the trailing FAILED entries belong to the attempt being retried: an
// iterator resets its loop steps by appending the previous iteration's outcome.
const countTrailingFailedAttempts = (
  history: NonNullable<WorkflowRunStepInfo['history']>,
): number => {
  let count = 0;

  for (let index = history.length - 1; index >= 0; index--) {
    if (history[index].status !== StepStatus.FAILED) {
      break;
    }

    count++;
  }

  return count;
};

export const getStepRetryDelayMs = ({
  step,
  stepInfo,
}: {
  step: WorkflowAction;
  stepInfo?: WorkflowRunStepInfo;
}): number | undefined => {
  if (!step.settings.errorHandlingOptions.retryOnFailure.value) {
    return undefined;
  }

  return STEP_RETRY_DELAYS_MS[
    countTrailingFailedAttempts(stepInfo?.history ?? [])
  ];
};
