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
  // resolved by a member's answer in a conversation: to the call posted there, or to the last pending one
  z.object({
    type: z.literal('ANSWER'),
    threadId: z.string(),
    toolCallId: z.string().optional(),
  }),
]);
