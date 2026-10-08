import { z } from 'zod';

// RUN: one conversation per run. STEP: a new one each time the step runs.
// KEY: steps of the workflow sharing a key write to the same conversation, across runs.
export const workflowConversationScopeSchema = z.enum(['RUN', 'STEP', 'KEY']);

export const workflowConversationSchema = z.object({
  scope: workflowConversationScopeSchema,
  key: z.string().optional(),
});
