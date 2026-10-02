import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export type ToolCallWorkflowStep = {
  workflowRunId: string;
  stepId: string;
};

// a workflow step posting a call to a member's inbox records itself in the pending output,
// which the server writes and the answer replaces, so the answer can resume that step
export const readToolCallWorkflowStep = (
  toolOutput: unknown,
): ToolCallWorkflowStep | null => {
  const workflowStep = isPlainObject(toolOutput)
    ? toolOutput.workflowStep
    : undefined;

  return isPlainObject(workflowStep) &&
    isNonEmptyString(workflowStep.workflowRunId) &&
    isNonEmptyString(workflowStep.stepId)
    ? {
        workflowRunId: workflowStep.workflowRunId,
        stepId: workflowStep.stepId,
      }
    : null;
};
