import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

// A step still runs until the executor marks it pending, so an outcome can arrive before it waits.
// A pending step with an error waits on a retry, not on what it handed its work to
export const getWorkflowStepWaitingState = ({
  workflowRun,
  stepId,
}: {
  workflowRun: Pick<WorkflowRunWorkspaceEntity, 'status' | 'state'> | null;
  stepId: string;
}): 'WAITING' | 'NOT_READY' | 'GONE' => {
  const stepInfo = workflowRun?.state?.stepInfos?.[stepId];

  if (workflowRun?.status !== WorkflowRunStatus.RUNNING) {
    return 'GONE';
  }

  if (stepInfo?.status === StepStatus.RUNNING) {
    return 'NOT_READY';
  }

  return stepInfo?.status === StepStatus.PENDING && !isDefined(stepInfo.error)
    ? 'WAITING'
    : 'GONE';
};
