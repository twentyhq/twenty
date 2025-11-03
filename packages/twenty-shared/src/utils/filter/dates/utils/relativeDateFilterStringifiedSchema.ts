import { relativeDateFilterSchema } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { isNonEmptyArray } from '@sniptt/guards';
import z from 'zod';

const REGEX_FOR_RELATIVE_DATE_FILTER_STRINGIFIED_PARSING =
  /((?:THIS)|(?:PAST)|(?:NEXT))_(\d*)_(DAY|MONTH|YEAR|WEEK)(?:(?:;;([^;;]*);;)?(?:(MONDAY|SUNDAY|SATURDAY);;)?)?/;

export const relativeDateFilterStringifiedSchema = z
  .string()
  .transform((value) => {
    const regexForParsingStringifiedRelativeDateFilter = new RegExp(
      REGEX_FOR_RELATIVE_DATE_FILTER_STRINGIFIED_PARSING,
    );

    const result = regexForParsingStringifiedRelativeDateFilter.exec(value);

    if (!isNonEmptyArray(result)) {
      throw new Error(`Cannot parse stringified relative date filter`);
    }

    const [_, direction, amount, unit, timezone, firstDayOfTheWeek] = result;

    return relativeDateFilterSchema.parse({
      direction,
      amount,
      unit,
      timezone,
      firstDayOfTheWeek,
    });
  });
