import { z } from 'zod';

import { pendingWakeUpConditionSchema } from '@/pending-wake-up/schemas/pending-wake-up-condition-schema';

export const workflowStepWaitSchema = z.discriminatedUnion('type', [
  // resolved when the agent run the step handed its work to calls it back
  z.object({ type: z.literal('CALLBACK') }),
  ...pendingWakeUpConditionSchema.options,
]);
