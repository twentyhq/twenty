import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowHttpRequestActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      url: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      headers: z.record(z.string(), z.string()).optional(),
      body: z
        .record(
          z.string(),
          z.union([
            z.string(),
            z.number(),
            z.boolean(),
            z.null(),
            z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
          ]),
        )
        .or(z.string())
        .optional(),
    }),
  });
