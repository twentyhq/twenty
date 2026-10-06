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
]);
