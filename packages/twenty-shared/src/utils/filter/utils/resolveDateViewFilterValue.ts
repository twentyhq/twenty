import { type Nullable, ViewFilterOperand } from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { computeTimezoneDifferenceInMinutes } from '@/utils/filter/utils/computeTimezoneDifferenceInMinutes';
import { isDefined } from '@/utils/validation';
import { TZDate } from '@date-fns/tz';
import { isNonEmptyString } from '@sniptt/guards';
import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  roundToNearestMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { z } from 'zod';

const variableDateViewFilterValueDirectionSchema = z.enum([
  'NEXT',
  'THIS',
  'PAST',
]);

export const firstDayOfWeekSchema = z.enum(['MONDAY', 'SATURDAY', 'SUNDAY']);

export type FirstDayOfTheWeek = z.infer<typeof firstDayOfWeekSchema>;

export type VariableDateViewFilterValueDirection = z.infer<
  typeof variableDateViewFilterValueDirectionSchema
>;

const variableDateViewFilterValueAmountSchema = z
  .union([z.coerce.number().int().positive(), z.literal('undefined')])
  .transform((val) => (val === 'undefined' ? undefined : val));

export const variableDateViewFilterValueUnitSchema = z.enum([
  'DAY',
  'WEEK',
  'MONTH',
  'YEAR',
]);

export type VariableDateViewFilterValueUnit = z.infer<
  typeof variableDateViewFilterValueUnitSchema
>;

export const variableDateViewFilterValuePartsSchema = z
  .object({
    direction: variableDateViewFilterValueDirectionSchema,
    amount: variableDateViewFilterValueAmountSchema,
    unit: variableDateViewFilterValueUnitSchema,
    timezone: z.string().nullish(),
    referenceDayAsString: z.string().nullish(),
    firstDayOfTheWeek: firstDayOfWeekSchema.nullish(),
  })
  .refine((data) => !(data.amount === undefined && data.direction !== 'THIS'), {
    error: "Amount cannot be 'undefined' unless direction is 'THIS'",
  });

const variableDateViewFilterValueSchema = z.string().transform((value) => {
  const [
    direction,
    amount,
    unit,
    timezone,
    referenceDayAsString,
    firstDayOfTheWeek,
  ] = value.split('_');

  return variableDateViewFilterValuePartsSchema.parse({
    direction,
    amount,
    unit,
    timezone,
    referenceDayAsString,
    firstDayOfTheWeek,
  });
});

const addUnit = (
  date: Date,
  amount: number,
  unit: VariableDateViewFilterValueUnit,
) => {
  switch (unit) {
    case 'DAY':
      return addDays(date, amount);
    case 'WEEK':
      return addWeeks(date, amount);
    case 'MONTH':
      return addMonths(date, amount);
    case 'YEAR':
      return addYears(date, amount);
  }
};

const subUnit = (
  date: Date,
  amount: number,
  unit: VariableDateViewFilterValueUnit,
) => {
  switch (unit) {
    case 'DAY':
      return subDays(date, amount);
    case 'WEEK':
      return subWeeks(date, amount);
    case 'MONTH':
      return subMonths(date, amount);
    case 'YEAR':
      return subYears(date, amount);
  }
};

const getFirstDayOfTheWeekAsANumberForDateFNS = (
  firstDayOfTheWeek: FirstDayOfTheWeek,
): 0 | 1 | 6 => {
  switch (firstDayOfTheWeek) {
    case 'MONDAY':
      return 1;
    case 'SATURDAY':
      return 6;
    case 'SUNDAY':
      return 0;
    default:
      return assertUnreachable(firstDayOfTheWeek);
  }
};

const startOfUnit = (
  date: Date,
  unit: VariableDateViewFilterValueUnit,
  firstDayOfTheWeek?: Nullable<FirstDayOfTheWeek>,
) => {
  switch (unit) {
    case 'DAY':
      return startOfDay(date);
    case 'WEEK': {
      if (isDefined(firstDayOfTheWeek)) {
        const firstDayOfTheWeekAsDateFNSNumber =
          getFirstDayOfTheWeekAsANumberForDateFNS(firstDayOfTheWeek);

        return startOfWeek(date, {
          weekStartsOn: firstDayOfTheWeekAsDateFNSNumber,
        });
      } else {
        return startOfWeek(date);
      }
    }
    case 'MONTH':
      return startOfMonth(date);
    case 'YEAR':
      return startOfYear(date);
  }
};

const endOfUnit = (
  date: Date,
  unit: VariableDateViewFilterValueUnit,
  firstDayOfTheWeek?: Nullable<FirstDayOfTheWeek>,
) => {
  switch (unit) {
    case 'DAY':
      return endOfDay(date);
    case 'WEEK': {
      if (isDefined(firstDayOfTheWeek)) {
        const firstDayOfTheWeekAsDateFNSNumber =
          getFirstDayOfTheWeekAsANumberForDateFNS(firstDayOfTheWeek);

        return endOfWeek(date, {
          weekStartsOn: firstDayOfTheWeekAsDateFNSNumber,
        });
      } else {
        return endOfWeek(date);
      }
    }
    case 'MONTH':
      return endOfMonth(date);
    case 'YEAR':
      return endOfYear(date);
  }
};

export type RelativeDateFilter = z.infer<
  typeof variableDateViewFilterValuePartsSchema
>;

const resolveVariableDateViewFilterValueFromRelativeDate = (
  relativeDateFilter: RelativeDateFilter,
) => {
  const { direction, amount, unit, timezone, firstDayOfTheWeek } =
    relativeDateFilter;

  const referenceDate = roundToNearestMinutes(
    isNonEmptyString(timezone)
      ? new TZDate().withTimeZone(timezone)
      : new TZDate(),
  );

  switch (direction) {
    case 'NEXT':
      if (amount === undefined) throw new Error('Amount is required');
      return {
        ...relativeDateFilter,
        start: referenceDate,
        end: addUnit(referenceDate, amount, unit),
      };
    case 'PAST':
      if (amount === undefined) throw new Error('Amount is required');
      return {
        ...relativeDateFilter,
        start: subUnit(referenceDate, amount, unit),
        end: referenceDate,
      };
    case 'THIS':
      return {
        ...relativeDateFilter,
        start: startOfUnit(referenceDate, unit, firstDayOfTheWeek),
        end: endOfUnit(referenceDate, unit, firstDayOfTheWeek),
      };
  }
};

const resolveVariableDateViewFilterValue = (value?: string | null) => {
  if (!value) return null;

  const relativeDate = variableDateViewFilterValueSchema.parse(value);

  const returnedRange =
    resolveVariableDateViewFilterValueFromRelativeDate(relativeDate);

  if (isDefined(relativeDate.timezone)) {
    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const timezoneDifferenceInMinutesForStartDateToPreventDST =
      computeTimezoneDifferenceInMinutes(
        relativeDate.timezone,
        systemTimeZone,
        returnedRange.start,
      );

    const timezoneDifferenceInMinutesForEndDateToPreventDST =
      computeTimezoneDifferenceInMinutes(
        relativeDate.timezone,
        systemTimeZone,
        returnedRange.end,
      );

    const shiftedStartDate = addMinutes(
      returnedRange.start,
      timezoneDifferenceInMinutesForStartDateToPreventDST,
    );

    const shiftedEndDate = addMinutes(
      returnedRange.end,
      timezoneDifferenceInMinutesForEndDateToPreventDST,
    );

    return {
      ...returnedRange,
      start: shiftedStartDate,
      end: shiftedEndDate,
    };
  }

  return returnedRange;
};

export type ResolvedDateViewFilterValue<O extends ViewFilterOperand> =
  O extends ViewFilterOperand.IS_RELATIVE
    ? ReturnType<typeof resolveVariableDateViewFilterValue>
    : Date | null;

type PartialViewFilter<O extends ViewFilterOperand> = {
  value: string;
  operand: O;
}; // TODO, was done to avoid ViewFilter export

export const resolveDateViewFilterValue = <O extends ViewFilterOperand>(
  viewFilter: PartialViewFilter<O>,
): ResolvedDateViewFilterValue<O> => {
  if (!viewFilter.value) return null;

  if (viewFilter.operand === ViewFilterOperand.IS_RELATIVE) {
    return resolveVariableDateViewFilterValue(
      viewFilter.value,
    ) as ResolvedDateViewFilterValue<O>;
  }
  return new Date(viewFilter.value) as ResolvedDateViewFilterValue<O>;
};
