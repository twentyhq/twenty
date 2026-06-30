import { firstDayOfWeekSchema } from '@/utils/filter/dates/utils/firstDayOfWeekSchema';
import { relativeDateFilterAmountSchema } from '@/utils/filter/dates/utils/relativeDateFilterAmountSchema';
import { relativeDateFilterDirectionSchema } from '@/utils/filter/dates/utils/relativeDateFilterDirectionSchema';
import { relativeDateFilterUnitSchema } from '@/utils/filter/dates/utils/relativeDateFilterUnitSchema';

import z from 'zod';

export const relativeDateFilterSchema = z
  .object({
    direction: relativeDateFilterDirectionSchema,
    amount: relativeDateFilterAmountSchema.nullish(),
    unit: relativeDateFilterUnitSchema,
    timezone: z.string().nullish(),
    firstDayOfTheWeek: firstDayOfWeekSchema.nullish(),
  })
  .refine((data) => !(data.amount === undefined && data.direction !== 'THIS'), {
    error: "Amount cannot be 'undefined' unless direction is 'THIS'",
  });

export type RelativeDateFilter = z.infer<typeof relativeDateFilterSchema>;
