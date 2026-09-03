import { type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { STEP_RETRY_DELAYS_MS } from 'src/modules/workflow/workflow-executor/constants/step-retry-delays.constant';
import { getStepRetryAttempt } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-attempt.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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

  return STEP_RETRY_DELAYS_MS[getStepRetryAttempt({ stepInfo })];
};
