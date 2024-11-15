import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-result.type';

export interface WorkflowAction {
  execute(workflowStepInput: unknown): Promise<WorkflowActionResult>;
}
