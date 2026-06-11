import { WorkflowActionType } from 'twenty-shared/workflow';
import { type WorkflowAction, type WorkflowUpdateRecordAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowUpdateRecordAction = (
  action: WorkflowAction,
): action is WorkflowUpdateRecordAction => {
  return action.type === WorkflowActionType.UPDATE_RECORD;
};
