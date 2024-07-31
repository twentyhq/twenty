import { WorkflowResult } from 'src/modules/workflow/common/types/workflow-result.type';
import { WorkflowAction } from 'src/modules/workflow/common/types/workflow-action.type';

export interface WorkflowExecutor {
  run({
    action,
    workspaceId,
    payload,
  }: {
    action: WorkflowAction;
    workspaceId: string;
    payload?: object;
  }): Promise<WorkflowResult>;
}
