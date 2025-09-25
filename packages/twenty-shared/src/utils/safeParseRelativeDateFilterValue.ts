import {
  type VariableDateViewFilterValue,
  type VariableDateViewFilterValueDirection,
  type VariableDateViewFilterValueUnit,
} from '@/types/RelativeDateValue';
import { z } from 'zod';

const RelativeDateValueSchema = z.object({
  direction: z.enum(['NEXT', 'THIS', 'PAST'] as const) as z.ZodType<VariableDateViewFilterValueDirection>,
  unit: z.enum(['DAY', 'WEEK', 'MONTH', 'YEAR'] as const) as z.ZodType<VariableDateViewFilterValueUnit>,
  amount: z.number().positive().optional(),
}).refine((data) => {
  if (data.direction === 'NEXT' || data.direction === 'PAST') {
    return data.amount !== undefined && data.amount > 0;
  }
  return true;
}, {
    error: 'Amount is required for NEXT and PAST directions and must be positive'
});

export const safeParseRelativeDateFilterValue = (
  value: string,
): VariableDateViewFilterValue | undefined => {
  try {
    const parsedJson = JSON.parse(value);

    const result = RelativeDateValueSchema.safeParse(parsedJson);

    if (result.success) {
      return result.data;
    }

    return undefined;
  } catch {
    return undefined;
  }
}
