import { relativeDateFilterSchema } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { isNonEmptyArray } from '@sniptt/guards';
import z from 'zod';

const REGEX_FOR_RELATIVE_DATE_FILTER_STRINGIFIED_PARSING =
  /((?:THIS)|(?:PAST)|(?:NEXT))_(\d*)_(DAY|MONTH|YEAR|WEEK|HOUR|MINUTE|SECOND)(?:(?:;;([^;;]*);;)?(?:(MONDAY|SUNDAY|SATURDAY);;)?)?/;

export const relativeDateFilterStringifiedSchema = z
  .string()
  .transform((value, context) => {
    const regexForParsingStringifiedRelativeDateFilter = new RegExp(
      REGEX_FOR_RELATIVE_DATE_FILTER_STRINGIFIED_PARSING,
    );

    const result = regexForParsingStringifiedRelativeDateFilter.exec(value);

    if (!isNonEmptyArray(result)) {
      context.addIssue(
        `Cannot parse stringified inline relative date filter, value : "${value}"`,
      );

      return z.NEVER;
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
