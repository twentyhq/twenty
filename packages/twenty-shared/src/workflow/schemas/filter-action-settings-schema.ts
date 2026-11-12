import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { stepFilterGroupSchema } from './step-filter-group-schema';
import { stepFilterSchema } from './step-filter-schema';

export const workflowFilterActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      stepFilterGroups: z.array(stepFilterGroupSchema),
      stepFilters: z.array(stepFilterSchema),
    }),
  });
