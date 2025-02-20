import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowStepResult } from 'src/modules/workflow/workflow-executor/types/workflow-step-result.type';

export interface WorkflowExecutor {
  execute(input: WorkflowExecutorInput): Promise<WorkflowStepResult>;
}
