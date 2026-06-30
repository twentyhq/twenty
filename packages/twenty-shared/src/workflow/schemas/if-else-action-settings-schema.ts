import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { stepFilterGroupSchema } from './step-filter-group-schema';
import { stepFilterSchema } from './step-filter-schema';

export const stepIfElseBranchSchema = z.object({
  id: z.string(),
  nextStepIds: z.array(z.string()),
  filterGroupId: z.string().optional(),
});

export const workflowIfElseActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      stepFilterGroups: z.array(stepFilterGroupSchema),
      stepFilters: z.array(stepFilterSchema),
      branches: z.array(stepIfElseBranchSchema),
    }),
  });
