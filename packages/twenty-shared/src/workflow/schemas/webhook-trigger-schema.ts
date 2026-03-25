import { z } from 'zod';
import { baseTriggerSchema } from './base-trigger-schema';

export const workflowWebhookTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('WEBHOOK'),
  settings: z.discriminatedUnion('httpMethod', [
    z.object({
      outputSchema: z.looseObject({}),
      httpMethod: z.literal('GET'),
      authentication: z.literal('API_KEY').nullable(),
    }),
    z.object({
      outputSchema: z.looseObject({}),
      httpMethod: z.literal('POST'),
      expectedBody: z.looseObject({}),
      authentication: z.literal('API_KEY').nullable(),
    }),
  ]),
});
