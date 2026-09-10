import {
  STEP_RETRY_DELAYS_MS,
  type WorkflowRunStepInfo,
} from 'twenty-shared/workflow';

import { getStepRetryAttempt } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-attempt.util';

export const getStepRetryDelayMs = ({
  stepInfo,
}: {
  stepInfo?: WorkflowRunStepInfo;
}): number => STEP_RETRY_DELAYS_MS[getStepRetryAttempt({ stepInfo })];
