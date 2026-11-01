import { z } from 'zod';
import { RecordFilterGroupLogicalOperator } from '../../types/RecordFilterGroupLogicalOperator';

export const recordFilterGroupSchema = z.object({
  id: z.string(),
  logicalOperator: z.enum(RecordFilterGroupLogicalOperator),
  parentRecordFilterGroupId: z.string().nullable().optional(),
  positionInRecordFilterGroup: z.number().nullable().optional(),
});
