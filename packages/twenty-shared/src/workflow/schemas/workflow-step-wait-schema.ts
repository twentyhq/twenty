import { z } from 'zod';

import { pendingWakeUpConditionSchema } from '@/pending-wake-up/schemas/pending-wake-up-condition-schema';

export const workflowStepWaitSchema = z.discriminatedUnion('type', [
  // resolved when someone answers the step's conversation
  z.object({ type: z.literal('ANSWER') }),
  ...pendingWakeUpConditionSchema.options,
]);
