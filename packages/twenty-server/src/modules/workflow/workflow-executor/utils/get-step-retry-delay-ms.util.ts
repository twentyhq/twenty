import {
  STEP_RETRY_DELAYS_MS,
  type WorkflowRunStepInfo,
} from 'twenty-shared/workflow';

import { getStepRetryAttempt } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-attempt.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getStepRetryDelayMs = ({
  step,
  stepInfo,
}: {
  step: WorkflowAction;
  stepInfo?: WorkflowRunStepInfo;
}): number | undefined => {
  const { value, maxAttempts } =
    step.settings.errorHandlingOptions.retryOnFailure;

  if (!value) {
    return undefined;
  }

  const attemptLimit = Math.min(
    maxAttempts ?? STEP_RETRY_DELAYS_MS.length,
    STEP_RETRY_DELAYS_MS.length,
  );

  const retryAttempt = getStepRetryAttempt({ stepInfo });

  if (retryAttempt >= attemptLimit) {
    return undefined;
  }

  return STEP_RETRY_DELAYS_MS[retryAttempt];
};
