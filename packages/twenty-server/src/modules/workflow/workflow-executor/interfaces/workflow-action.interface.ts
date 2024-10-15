import { WorkflowActionResult } from 'src/modules/workflow/workflow-executor/types/workflow-action-result.type';

export interface WorkflowAction {
  execute(payload: Record<string, any>): Promise<WorkflowActionResult>;
}
