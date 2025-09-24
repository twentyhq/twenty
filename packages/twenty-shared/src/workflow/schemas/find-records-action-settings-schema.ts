import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowFindRecordsActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      limit: z.number().optional(),
      filter: z
        .object({
          recordFilterGroups: z.array(z.any()).optional(),
          recordFilters: z.array(z.any()).optional(),
          gqlOperationFilter: z.any().optional().nullable(),
        })
        .optional(),
    }),
  });
