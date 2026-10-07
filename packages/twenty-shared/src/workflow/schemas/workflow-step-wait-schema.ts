import { z } from 'zod';

import { pendingWakeUpConditionSchema } from '@/pending-wake-up/schemas/pending-wake-up-condition-schema';

export const workflowStepWaitSchema = z.discriminatedUnion('type', [
  // resolved when what the step handed its work to calls it back, such as an answer or an agent run
  z.object({ type: z.literal('CALLBACK') }),
  ...pendingWakeUpConditionSchema.options,
]);
