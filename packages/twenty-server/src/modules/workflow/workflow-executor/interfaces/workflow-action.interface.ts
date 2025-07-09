import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';

export interface WorkflowAction {
  execute(
    workflowActionInput: WorkflowActionInput,
  ): Promise<WorkflowActionOutput>;
}
