import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

const workflowVariableReferenceSchema = z
  .string()
  .regex(
    /^{{[^{}]+}}$/,
    'Expected a workflow variable reference like {{stepId.path}}',
  );

export const workflowFindRecordsActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      limit: z.union([z.number(), workflowVariableReferenceSchema]).optional(),
      offset: z
        .union([z.number().int().nonnegative(), workflowVariableReferenceSchema])
        .optional(),
      filter: z
        .object({
          recordFilterGroups: z.array(z.any()).optional(),
          recordFilters: z.array(z.any()).optional(),
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
