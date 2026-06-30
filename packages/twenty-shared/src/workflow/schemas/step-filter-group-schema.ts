import { z } from 'zod';
import { StepLogicalOperator } from '../../types/StepFilters';

export const stepFilterGroupSchema = z.object({
  id: z.string(),
  logicalOperator: z.enum(StepLogicalOperator),
  parentStepFilterGroupId: z.string().optional(),
  positionInStepFilterGroup: z.number().optional(),
});
