import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowCreateInboxItemAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowCreateInboxItemAction = (
  action: WorkflowAction,
): action is WorkflowCreateInboxItemAction => {
  return action.type === WorkflowActionType.CREATE_INBOX_ITEM;
};
