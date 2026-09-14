import { WorkflowActionType } from 'twenty-shared/workflow';
import {
  type WorkflowAction,
  type WorkflowRunWorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowRunWorkflowAction = (
  action: WorkflowAction,
): action is WorkflowRunWorkflowAction => {
  return action.type === WorkflowActionType.RUN_WORKFLOW;
};
