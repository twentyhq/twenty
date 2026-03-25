import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowIfElseAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowIfElseAction = (
  action: WorkflowAction,
): action is WorkflowIfElseAction => action.type === WorkflowActionType.IF_ELSE;
