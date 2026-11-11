import { Temporal } from 'temporal-polyfill';
import {
  FieldMetadataType,
  type FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  isPlainDateAfter,
  isPlainDateBefore,
  relativeDateFilterStringifiedSchema,
  resolveRelativeDateFilter,
} from 'twenty-shared/utils';

import { type DateRangeBounds } from 'src/modules/dashboard/chart-data/types/date-range-bounds.type';

const resolveConditionDateRange = ({
  condition: { operand, value },
  fieldType,
  now,
  firstDayOfTheWeek,
}: {
  condition: PageLayoutFilterCondition;
  fieldType: FieldMetadataType;
  now: Temporal.ZonedDateTime;
  firstDayOfTheWeek: FirstDayOfTheWeek;
}): DateRangeBounds => {
  const today = now.toPlainDate();

  switch (operand) {
    case ViewFilterOperand.IS_AFTER:
      return { start: Temporal.PlainDate.from(value), end: null };
    // Half-open wire contract: the IS_BEFORE day itself is excluded
    case ViewFilterOperand.IS_BEFORE:
      return {
        start: null,
        end: Temporal.PlainDate.from(value).subtract({ days: 1 }),
      };
    case ViewFilterOperand.IS: {
      const day = Temporal.PlainDate.from(value);

      return { start: day, end: day };
    }
    case ViewFilterOperand.IS_TODAY:
      return { start: today, end: today };
    case ViewFilterOperand.IS_IN_PAST:
      return {
        start: null,
        end:
          fieldType === FieldMetadataType.DATE
            ? today.subtract({ days: 1 })
            : today,
      };
    case ViewFilterOperand.IS_IN_FUTURE:
      return { start: today, end: null };
    case ViewFilterOperand.IS_RELATIVE: {
      const relativeDateFilter =
        relativeDateFilterStringifiedSchema.parse(value);
      const { start, end } = resolveRelativeDateFilter(
        {
          ...relativeDateFilter,
          firstDayOfTheWeek:
            relativeDateFilter.firstDayOfTheWeek ?? firstDayOfTheWeek,
        },
        now,
      );

      return {
        start: isDefined(start) ? Temporal.PlainDate.from(start) : null,
        end: isDefined(end)
          ? Temporal.PlainDate.from(end).subtract({ days: 1 })
          : null,
      };
    }
    default:
      return { start: null, end: null };
  }
};

// Conditions are ANDed, so the range is their intersection; end is the last included day
export const resolveDashboardFilterConditionsDateRange = ({
  conditions,
  fieldType,
  now,
  firstDayOfTheWeek,
}: {
  conditions: PageLayoutFilterCondition[];
  fieldType: FieldMetadataType;
  now: Temporal.ZonedDateTime;
  firstDayOfTheWeek: FirstDayOfTheWeek;
}): DateRangeBounds =>
  conditions.reduce<DateRangeBounds>(
    (range, condition) => {
      const { start, end } = resolveConditionDateRange({
        condition,
        fieldType,
        now,
        firstDayOfTheWeek,
      });

      return {
        start:
          isDefined(start) &&
          (!isDefined(range.start) || isPlainDateAfter(start, range.start))
            ? start
            : range.start,
        end:
          isDefined(end) &&
          (!isDefined(range.end) || isPlainDateBefore(end, range.end))
            ? end
            : range.end,
      };
    },
    { start: null, end: null },
  );
