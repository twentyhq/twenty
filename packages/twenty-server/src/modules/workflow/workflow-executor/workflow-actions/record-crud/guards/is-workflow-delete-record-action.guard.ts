import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowDeleteRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowDeleteRecordAction = (
  action: WorkflowAction,
): action is WorkflowDeleteRecordAction => {
  return action.type === WorkflowActionType.DELETE_RECORD;
};
