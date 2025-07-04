import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';

export interface WorkflowAction {
  execute(
    workflowActionInput: WorkflowActionInput,
  ): Promise<WorkflowActionOutput>;
}
