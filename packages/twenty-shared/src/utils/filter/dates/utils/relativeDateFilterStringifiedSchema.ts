import { relativeDateFilterSchema } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import z from 'zod';

export const relativeDateFilterStringifiedSchema = z
  .string()
  .transform((value) => {
    const [
      direction,
      amount,
      unit,
      timezone,
      referenceDayAsString,
      firstDayOfTheWeek,
    ] = value.split('_');

    return relativeDateFilterSchema.parse({
      direction,
      amount,
      unit,
      timezone,
      referenceDayAsString,
      firstDayOfTheWeek,
    });
  });
