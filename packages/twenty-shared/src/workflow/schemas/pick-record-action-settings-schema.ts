import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowPickRecordStrategySchema = z.enum([
  'RANDOM',
  'ROUND_ROBIN',
  'LOAD_BALANCED',
]);

export const workflowPickRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      strategy: workflowPickRecordStrategySchema,
      recordIds: z.array(z.string()),
      loadBalance: z
        .object({
          objectNameSingular: z.string(),
          fieldName: z.string(),
        })
        .optional(),
    }),
  });
