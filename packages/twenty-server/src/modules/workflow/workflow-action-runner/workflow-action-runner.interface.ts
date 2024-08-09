import { WorkflowResult } from 'src/modules/workflow/common/types/workflow-result.type';
import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';

export interface WorkflowActionRunner {
  execute({
    action,
    workspaceId,
    payload,
  }: {
    action: WorkflowAction;
    workspaceId: string;
    payload?: object;
  }): Promise<WorkflowResult>;
}
