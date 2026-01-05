import { ViewFilterOperandDeprecated } from '@/types';
import { z } from 'zod';
import { ViewFilterOperand } from '../../types/ViewFilterOperand';

export const stepFilterSchema = z.object({
  id: z.string(),
  type: z.string(),
  stepOutputKey: z.string(),
  operand: z.enum(ViewFilterOperand).or(z.enum(ViewFilterOperandDeprecated)),
  value: z.string(),
  stepFilterGroupId: z.string(),
  positionInStepFilterGroup: z.number().optional(),
  fieldMetadataId: z.string().optional(),
  compositeFieldSubFieldName: z.string().optional(),
});
