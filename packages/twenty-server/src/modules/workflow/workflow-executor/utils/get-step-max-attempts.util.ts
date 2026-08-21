import { type WorkflowActionType } from 'twenty-shared/workflow';

import {
  NON_REPLAYABLE_WORKFLOW_ACTION_TYPES,
  WORKFLOW_STEP_MAX_ATTEMPTS,
} from 'src/modules/workflow/workflow-executor/constants/workflow-step-retry.constant';

export const getStepMaxAttempts = (stepType: WorkflowActionType): number =>
  NON_REPLAYABLE_WORKFLOW_ACTION_TYPES.includes(stepType)
    ? 1
    : WORKFLOW_STEP_MAX_ATTEMPTS;
