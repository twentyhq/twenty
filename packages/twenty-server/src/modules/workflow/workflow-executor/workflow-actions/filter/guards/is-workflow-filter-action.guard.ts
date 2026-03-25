import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowFilterAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowFilterAction = (
  action: WorkflowAction,
): action is WorkflowFilterAction => action.type === WorkflowActionType.FILTER;
