import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowSendChatMessageAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowSendChatMessageAction = (
  action: WorkflowAction,
): action is WorkflowSendChatMessageAction =>
  action.type === WorkflowActionType.SEND_CHAT_MESSAGE;
