import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';
import { recordFilterGroupSchema } from './record-filter-group-schema';
import { recordFilterSchema } from './record-filter-schema';
import { workflowVariableReferenceSchema } from './workflow-variable-reference-schema';

export const workflowFindRecordsActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      limit: z.union([z.number(), workflowVariableReferenceSchema]).optional(),
      offset: z
        .union([
          z.number().int().nonnegative(),
          workflowVariableReferenceSchema,
        ])
        .optional(),
      filter: z
        .object({
          recordFilterGroups: z.array(recordFilterGroupSchema).optional(),
          recordFilters: z.array(recordFilterSchema).optional(),
        })
        .optional(),
      orderBy: z
        .object({
          recordSorts: z.array(z.any()).optional(),
          gqlOperationOrderBy: z
            .array(z.record(z.string(), z.any()))
            .optional(),
        })
        .optional(),
    }),
  });
