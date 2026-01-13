import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowN8nAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowN8nAction = (
  action: WorkflowAction,
): action is WorkflowN8nAction => {
  return action.type === WorkflowActionType.N8N;
};
