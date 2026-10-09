import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { workflowConversationSchema } from './workflow-conversation-schema';

export const workflowSendChatMessageActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      workspaceMemberId: z.string(),
      title: z.string(),
      text: z.string(),
      // a tool call the recipient approves, edits or rejects before the run goes on
      toolCall: z
        .object({
          toolName: z.string(),
          arguments: z.record(z.string(), z.any()),
        })
        .optional(),
      // one conversation per run when unset
      conversation: workflowConversationSchema.optional(),
    }),
  });
