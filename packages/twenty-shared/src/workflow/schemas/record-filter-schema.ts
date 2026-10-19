import { z } from 'zod';
import { ViewFilterOperand } from '../../types/ViewFilterOperand';

export const recordFilterSchema = z.object({
  id: z.string().optional(),
  fieldMetadataId: z.string(),
  operand: z.enum(ViewFilterOperand),
  value: z.string().nullable().optional(),
  recordFilterGroupId: z.string().nullable().optional(),
  positionInRecordFilterGroup: z.number().nullable().optional(),
  subFieldName: z.string().nullable().optional(),
  relationTargetFieldMetadataId: z.string().nullable().optional(),
});
