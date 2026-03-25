import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowLogicFunctionAction = (
  action: WorkflowAction,
): action is WorkflowAction & { type: WorkflowActionType.LOGIC_FUNCTION } => {
  return action.type === WorkflowActionType.LOGIC_FUNCTION;
};
