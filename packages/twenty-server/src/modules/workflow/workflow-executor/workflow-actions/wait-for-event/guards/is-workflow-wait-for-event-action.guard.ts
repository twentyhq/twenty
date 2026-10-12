import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowWaitForEventAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowWaitForEventAction = (
  action: WorkflowAction,
): action is WorkflowWaitForEventAction =>
  action.type === WorkflowActionType.WAIT_FOR_EVENT;
