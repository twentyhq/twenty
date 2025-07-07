import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export type WorkflowActionInput = {
  currentStepId: string;
  steps: WorkflowAction[];
  context: Record<string, unknown>;
};
