import {
  relativeDateFilterSchema,
  type RelativeDateFilter,
} from '@/utils/filter/dates/utils/relativeDateFilterSchema';

// const RelativeDateValueSchema = z
//   .object({
//     direction: z.enum([
//       'NEXT',
//       'THIS',
//       'PAST',
//     ] as const) as z.ZodType<RelativeDateFilterDirection>,
//     unit: z.enum([
//       'DAY',
//       'WEEK',
//       'MONTH',
//       'YEAR',
//     ] as const) as z.ZodType<RelativeDateFilterUnit>,
//     amount: z.number().positive().optional(),
//   })
//   .refine(
//     (data) => {
//       if (data.direction === 'NEXT' || data.direction === 'PAST') {
//         return data.amount !== undefined && data.amount > 0;
//       }
//       return true;
//     },
//     {
//       error:
//         'Amount is required for NEXT and PAST directions and must be positive',
//     },
//   );

// TODO: test this

export const safeParseRelativeDateFilterValue = (
  value: string,
): RelativeDateFilter | undefined => {
  try {
    const parsedJson = JSON.parse(value);

    const result = relativeDateFilterSchema.safeParse(parsedJson);

    if (result.success) {
      return result.data;
    }

    return undefined;
  } catch {
    return undefined;
  }
};
