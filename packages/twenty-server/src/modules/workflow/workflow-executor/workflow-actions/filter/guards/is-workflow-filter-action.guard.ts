import { WorkflowActionType } from 'twenty-shared/workflow';
import {
  type WorkflowAction,
  type WorkflowFilterAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowFilterAction = (
  action: WorkflowAction,
): action is WorkflowFilterAction => action.type === WorkflowActionType.FILTER;
