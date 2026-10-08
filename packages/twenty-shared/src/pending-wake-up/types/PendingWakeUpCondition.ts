import { type pendingWakeUpConditionSchema } from '@/pending-wake-up/schemas/pending-wake-up-condition-schema';
import type z from 'zod';

export type PendingWakeUpCondition = z.infer<
  typeof pendingWakeUpConditionSchema
>;
