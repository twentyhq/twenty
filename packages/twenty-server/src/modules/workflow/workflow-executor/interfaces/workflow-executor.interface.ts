import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';

export interface WorkflowExecutor {
  execute(workflowStepInput: unknown): Promise<WorkflowExecutorOutput>;
}
