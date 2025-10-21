import {
  type WorkflowAction,
  WorkflowActionType,
  type WorkflowUpsertRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowUpsertRecordAction = (
  action: WorkflowAction,
): action is WorkflowUpsertRecordAction => {
  return action.type === WorkflowActionType.UPSERT_RECORD;
};
