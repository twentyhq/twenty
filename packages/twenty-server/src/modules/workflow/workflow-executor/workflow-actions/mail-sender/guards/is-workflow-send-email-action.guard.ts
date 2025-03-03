import {
  WorkflowAction,
  WorkflowActionType,
  WorkflowSendEmailAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowSendEmailAction = (
  action: WorkflowAction,
): action is WorkflowSendEmailAction => {
  return action.type === WorkflowActionType.SEND_EMAIL;
};
