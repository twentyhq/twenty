import { ViewFilterOperandDeprecated } from '@/types';
import { z } from 'zod';
import { StepLogicalOperator } from '../../types/StepFilters';
import { ViewFilterOperand } from '../../types/ViewFilterOperand';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const stepIfElseBranchSchema = z.object({
  id: z.string(),
  nextStepIds: z.array(z.string()),
  filterGroupId: z.string().optional(),
});

export const workflowIfElseActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      stepFilterGroups: z.array(
        z.object({
          id: z.string(),
          logicalOperator: z.enum(StepLogicalOperator),
          parentStepFilterGroupId: z.string().optional(),
          positionInStepFilterGroup: z.number().optional(),
        }),
      ),
      stepFilters: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          stepOutputKey: z.string(),
          operand: z
            .enum(ViewFilterOperand)
            .or(z.enum(ViewFilterOperandDeprecated)),
          value: z.string(),
          stepFilterGroupId: z.string(),
          positionInStepFilterGroup: z.number().optional(),
          fieldMetadataId: z.string().optional(),
          compositeFieldSubFieldName: z.string().optional(),
        }),
      ),
      branches: z.array(stepIfElseBranchSchema),
    }),
  });
