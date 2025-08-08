import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowCreateRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowCreateRecordAction = (
  action: WorkflowAction,
): action is WorkflowCreateRecordAction => {
  return action.type === WorkflowActionType.CREATE_RECORD;
};
