import { isString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';

import { isDefined } from '@/utils/validation/isDefined';

import { relativeDateFilterSchema } from '@/utils/filter/dates/utils/relativeDateFilterSchema';
import { resolveRelativeDateTimeFilter } from '@/utils/filter/dates/utils/resolveRelativeDateTimeFilter';
import { getValidationRuleNowInUtc } from '@/utils/validation-rule/internal/getValidationRuleNowInUtc';

const parseToInstant = (value: string): Temporal.Instant | null => {
  try {
    return Temporal.Instant.from(value);
  } catch {
    //
  }

  try {
    return Temporal.PlainDate.from(value)
      .toZonedDateTime({ timeZone: 'UTC' })
      .toInstant();
  } catch {
    return null;
  }
};

// Same periods as the workflow relative date filter: in UTC, start included, end excluded
export const isValidationRuleDateInRelativeRange = (
  value: unknown,
  direction: unknown,
  amount: unknown,
  unit: unknown,
): boolean => {
  if (!isString(value) || (direction !== 'THIS' && !isDefined(amount))) {
    return false;
  }

  const instant = parseToInstant(value);
  const relativeDateFilter = relativeDateFilterSchema.safeParse({
    direction,
    amount: direction === 'THIS' ? undefined : amount,
    unit,
  });

  if (!isDefined(instant) || !relativeDateFilter.success) {
    return false;
  }

  const { start, end } = resolveRelativeDateTimeFilter(
    relativeDateFilter.data,
    getValidationRuleNowInUtc(),
  );

  return (
    Temporal.Instant.compare(instant, start.toInstant()) >= 0 &&
    Temporal.Instant.compare(instant, end.toInstant()) < 0
  );
};
