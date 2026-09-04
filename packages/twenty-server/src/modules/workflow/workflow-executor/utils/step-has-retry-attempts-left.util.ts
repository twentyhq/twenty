import {
  STEP_RETRY_DELAYS_MS,
  type WorkflowRunStepInfo,
} from 'twenty-shared/workflow';

import { getStepConfiguredRetryCount } from 'src/modules/workflow/workflow-executor/utils/get-step-configured-retry-count.util';
import { getStepRetryAttempt } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-attempt.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const stepHasRetryAttemptsLeft = ({
  step,
  stepInfo,
}: {
  step: WorkflowAction;
  stepInfo?: WorkflowRunStepInfo;
}): boolean => {
  const maxRetryAttempts = Math.min(
    getStepConfiguredRetryCount(step),
    STEP_RETRY_DELAYS_MS.length,
  );

  return getStepRetryAttempt({ stepInfo }) < maxRetryAttempts;
};
