import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { getStepConfiguredRetryCount } from 'src/modules/workflow/workflow-executor/utils/get-step-configured-retry-count.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const stepIsAwaitingRetry = ({
  step,
  stepInfo,
}: {
  step: WorkflowAction;
  stepInfo?: WorkflowRunStepInfo;
}): boolean =>
  stepInfo?.status === StepStatus.PENDING &&
  isDefined(stepInfo.error) &&
  getStepConfiguredRetryCount(step) > 0;
