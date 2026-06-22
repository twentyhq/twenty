import { z } from 'zod';
import { isDefined } from '@/utils';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowPickRecordStrategySchema = z.enum([
  'RANDOM',
  'ROUND_ROBIN',
  'LOAD_BALANCED',
]);

export const workflowPickRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z
      .object({
        objectName: z.string(),
        strategy: workflowPickRecordStrategySchema,
        recordIds: z.array(z.string()),
        loadBalance: z
          .object({
            objectNameSingular: z.string(),
            fieldName: z.string(),
          })
          .optional(),
      })
      .superRefine((input, ctx) => {
        if (
          input.strategy === 'LOAD_BALANCED' &&
          !isDefined(input.loadBalance)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['loadBalance'],
            message: 'loadBalance is required when strategy is LOAD_BALANCED',
          });
        }
      }),
  });
