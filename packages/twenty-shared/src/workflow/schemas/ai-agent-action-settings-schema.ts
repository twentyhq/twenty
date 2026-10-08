import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { workflowConversationSchema } from './workflow-conversation-schema';

export const workflowAiAgentActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      agentId: z.string().optional(),
      prompt: z.string().optional(),
      // Empty by default: stopping for a person pauses the run, which existing workflows were not built to expect.
      humanInputInstructions: z.string().optional(),
      // the member the agent's conversation is with, the workflow's creator when empty
      workspaceMemberId: z.string().optional(),
      // a new conversation each time the step runs when unset
      conversation: workflowConversationSchema.optional(),
    }),
  });
