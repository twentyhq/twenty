import {
    type WorkflowAction,
    WorkflowActionType,
    type WorkflowCreateOrUpdateRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowCreateOrUpdateRecordAction = (
  action: WorkflowAction,
): action is WorkflowCreateOrUpdateRecordAction => {
  return action.type === WorkflowActionType.CREATE_OR_UPDATE_RECORD;
};
