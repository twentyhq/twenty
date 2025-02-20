import { WorkflowStep } from 'src/modules/workflow/workflow-executor/types/workflow-step.type';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export type WorkflowExecutorInput = {
  currentStepIndex: number;
  steps: (WorkflowAction | WorkflowStep)[];
  context: Record<string, unknown>;
  attemptCount?: number;
  workflowRunId: string;
};
