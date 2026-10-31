import { z } from 'zod';

import { workflowConversationSchema } from './workflow-conversation-schema';

export const workflowAiAgentConversationConfigSchema = z.object({
  // Empty by default: stopping for a person pauses the run, which existing workflows were not built to expect.
  humanInputInstructions: z.string().optional(),
  conversation: workflowConversationSchema.optional(),
});
