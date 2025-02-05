import { WorkflowActionResult } from 'twenty-shared';

export interface WorkflowAction {
  execute(workflowStepInput: unknown): Promise<WorkflowActionResult>;
}
