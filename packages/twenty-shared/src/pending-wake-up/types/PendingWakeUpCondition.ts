import { type pendingWakeUpConditionSchema } from '@/pending-wake-up/schemas/pending-wake-up-condition-schema';
import type z from 'zod';

export type PendingWakeUpCondition =
  | z.infer<typeof pendingWakeUpConditionSchema>
  // kept out of the schema: only a conversation's waiting line arms it, resolved when the conversation lets go
  | { type: 'CONVERSATION_RELEASE'; threadId: string };
