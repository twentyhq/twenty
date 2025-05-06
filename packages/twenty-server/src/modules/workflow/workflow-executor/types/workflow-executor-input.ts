import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export type WorkflowExecutorInput = {
  currentStepId: string;
  steps: WorkflowAction[];
  context: Record<string, unknown>;
  workflowRunId: string;
  attemptCount?: number;
};
