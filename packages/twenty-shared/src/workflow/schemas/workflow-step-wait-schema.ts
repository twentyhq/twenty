import { z } from 'zod';

export const workflowStepWaitSchema = z.discriminatedUnion('type', [
  // resolved when someone answers the step's conversation
  z.object({ type: z.literal('ANSWER') }),
  z.object({ type: z.literal('TIME'), resumeAt: z.string() }),
  z.object({
    type: z.literal('EVENT'),
    eventName: z.string(),
    recordId: z.string().optional(),
    updatedFields: z.array(z.string()).optional(),
    expiresAt: z.string().optional(),
  }),
]);
