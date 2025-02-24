import {
  WorkflowAction,
  WorkflowActionType,
  WorkflowUpdateRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowUpdateRecordAction = (
  action: WorkflowAction,
): action is WorkflowUpdateRecordAction => {
  return action.type === WorkflowActionType.UPDATE_RECORD;
};
