import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowFormAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowFormAction = (
  action: WorkflowAction,
): action is WorkflowFormAction => action.type === WorkflowActionType.FORM;
