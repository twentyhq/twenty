import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowClassifyAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowClassifyAction = (
  action: WorkflowAction,
): action is WorkflowClassifyAction =>
  action.type === WorkflowActionType.CLASSIFY;
