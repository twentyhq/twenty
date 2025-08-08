import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowFindRecordsAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowFindRecordsAction = (
  action: WorkflowAction,
): action is WorkflowFindRecordsAction => {
  return action.type === WorkflowActionType.FIND_RECORDS;
};
