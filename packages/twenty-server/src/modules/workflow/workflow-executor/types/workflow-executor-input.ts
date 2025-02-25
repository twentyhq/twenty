import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export type WorkflowExecutorInput = {
  currentStepIndex: number;
  steps: WorkflowAction[];
  context: Record<string, unknown>;
  workflowRunId: string;
  attemptCount?: number;
};
