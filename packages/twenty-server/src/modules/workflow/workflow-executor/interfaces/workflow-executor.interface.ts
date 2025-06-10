import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';

export interface WorkflowExecutor {
  execute(
    workflowExecutorInput: WorkflowExecutorInput,
  ): Promise<WorkflowExecutorOutput>;
}
