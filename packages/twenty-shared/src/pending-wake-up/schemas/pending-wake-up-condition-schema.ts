import { z } from 'zod';

export const pendingWakeUpConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('TIME'), resumeAt: z.string() }),
  z.object({
    type: z.literal('EVENT'),
    eventName: z.string(),
    recordId: z.string().optional(),
    updatedFields: z.array(z.string()).optional(),
    expiresAt: z.string().optional(),
  }),
  // resolved by the member's answer to a call posted in a conversation, such as an approval
  z.object({
    type: z.literal('ANSWER'),
    threadId: z.string(),
    toolCallId: z.string(),
  }),
]);
