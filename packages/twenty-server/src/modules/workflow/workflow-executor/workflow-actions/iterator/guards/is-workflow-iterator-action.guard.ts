import { WorkflowActionType } from 'twenty-shared/workflow';
import { type WorkflowAction, type WorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowIteratorAction = (
  action: WorkflowAction,
): action is WorkflowIteratorAction =>
  action.type === WorkflowActionType.ITERATOR;
