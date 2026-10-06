import { type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';

export type WorkflowWaitResolutionInput = {
  step: WorkflowAction;
  stepInfo: WorkflowRunStepInfo;
  outcome: PendingWakeUpOutcome;
  runInfo: WorkflowRunInfo;
};
