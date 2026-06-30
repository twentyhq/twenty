import { z } from 'zod';
import { workflowCronTriggerSchema } from './cron-trigger-schema';
import { workflowDatabaseEventTriggerSchema } from './database-event-trigger-schema';
import { workflowManualTriggerSchema } from './manual-trigger-schema';
import { workflowWebhookTriggerSchema } from './webhook-trigger-schema';

export const workflowTriggerSchema = z.discriminatedUnion('type', [
  workflowDatabaseEventTriggerSchema,
  workflowManualTriggerSchema,
  workflowCronTriggerSchema,
  workflowWebhookTriggerSchema,
]);
