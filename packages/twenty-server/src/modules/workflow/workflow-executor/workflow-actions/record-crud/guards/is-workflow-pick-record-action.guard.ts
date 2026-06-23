import { WorkflowActionType } from 'twenty-shared/workflow';
import {
  type WorkflowAction,
  type WorkflowPickRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowPickRecordAction = (
  action: WorkflowAction,
): action is WorkflowPickRecordAction => {
  return action.type === WorkflowActionType.PICK_RECORD;
};
