import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowIteratorActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      items: z
        .union([
          z.array(
            z.union([
              z.string(),
              z.number(),
              z.boolean(),
              z.null(),
              z.record(z.string(), z.any()),
              z.any(),
            ]),
          ),
          z.string(),
        ])
        .optional(),
      initialLoopStepIds: z.array(z.string()).optional(),
    }),
  });
