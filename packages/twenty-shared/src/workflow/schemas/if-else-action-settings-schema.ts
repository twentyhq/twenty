import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { stepFilterGroupSchema } from './step-filter-group-schema';
import { stepFilterSchema } from './step-filter-schema';

export const stepIfElseBranchSchema = z.object({
  id: z.string(),
  nextStepIds: z.array(z.string()),
  filterGroupId: z.string().optional(),
  condition: z
    .string()
    .optional()
    .describe(
      'Optional rule expression over workflow variables, e.g. `{{step-id.amount}} > 1000`. When set, the branch filters are ignored.',
    ),
});

export const workflowIfElseActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      stepFilterGroups: z.array(stepFilterGroupSchema),
      stepFilters: z.array(stepFilterSchema),
      branches: z.array(stepIfElseBranchSchema),
    }),
  });
