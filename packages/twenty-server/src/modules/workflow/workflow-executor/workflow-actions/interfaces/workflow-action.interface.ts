import { WorkflowStepResult } from 'src/modules/workflow/workflow-executor/types/workflow-step-result.type';

export interface WorkflowAction {
  execute(workflowStepInput: unknown): Promise<WorkflowStepResult>;
}
