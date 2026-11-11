import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { stepFilterGroupSchema } from './step-filter-group-schema';
import { stepFilterSchema } from './step-filter-schema';

export const workflowFilterActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      stepFilterGroups: z.array(stepFilterGroupSchema),
      stepFilters: z.array(stepFilterSchema),
      condition: z
        .string()
        .optional()
        .describe(
          'Optional rule expression over workflow variables, e.g. `{{trigger.properties.after.amount}} > 1000 and {{step-id.status}} == "WON"`. When set, the step filters are ignored.',
        ),
    }),
  });
