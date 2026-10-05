import { type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowWaitOutcome } from 'src/modules/workflow/workflow-wait/types/workflow-wait-outcome.type';

export type WorkflowWaitResolutionInput = {
  step: WorkflowAction;
  stepInfo: WorkflowRunStepInfo;
  outcome: WorkflowWaitOutcome;
  runInfo: WorkflowRunInfo;
};
