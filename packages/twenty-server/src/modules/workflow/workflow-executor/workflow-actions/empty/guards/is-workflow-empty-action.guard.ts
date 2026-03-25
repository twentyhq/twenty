import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowEmptyAction = (
  action: WorkflowAction,
): action is WorkflowAction & { type: WorkflowActionType.EMPTY } => {
  return action.type === WorkflowActionType.EMPTY;
};
