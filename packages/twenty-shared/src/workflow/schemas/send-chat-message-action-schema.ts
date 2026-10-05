import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowSendChatMessageActionSettingsSchema } from './send-chat-message-action-settings-schema';

export const workflowSendChatMessageActionSchema =
  baseWorkflowActionSchema.extend({
    type: z.literal('SEND_CHAT_MESSAGE'),
    settings: workflowSendChatMessageActionSettingsSchema,
  });
