import {
  STEP_RETRY_DELAYS_MS,
  type WorkflowRunStepInfo,
} from 'twenty-shared/workflow';

import { getStepConfiguredRetryCount } from 'src/modules/workflow/workflow-executor/utils/get-step-configured-retry-count.util';
import { getStepRetryAttempt } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-attempt.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getStepRetryDelayMs = ({
  step,
  stepInfo,
}: {
  step: WorkflowAction;
  stepInfo?: WorkflowRunStepInfo;
}): number | undefined => {
  const configuredRetries = getStepConfiguredRetryCount(step);

  const attemptLimit = Math.min(configuredRetries, STEP_RETRY_DELAYS_MS.length);

  const retryAttempt = getStepRetryAttempt({ stepInfo });

  if (retryAttempt >= attemptLimit) {
    return undefined;
  }

  return STEP_RETRY_DELAYS_MS[retryAttempt];
};
