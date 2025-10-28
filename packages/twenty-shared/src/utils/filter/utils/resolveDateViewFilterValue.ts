import { ViewFilterOperand } from '@/types';
import { isDefined } from '@/utils/validation';
import { TZDate, tzOffset } from '@date-fns/tz';
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
  })
  .refine((data) => !(data.amount === undefined && data.direction !== 'THIS'), {
    error: "Amount cannot be 'undefined' unless direction is 'THIS'",
  });

const variableDateViewFilterValueSchema = z.string().transform((value) => {
  const [direction, amount, unit, timezone, referenceDayAsString] =
    value.split('_');

  return variableDateViewFilterValuePartsSchema.parse({
    direction,
    amount,
    unit,
    timezone,
    referenceDayAsString,
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

const startOfUnit = (date: Date, unit: VariableDateViewFilterValueUnit) => {
  switch (unit) {
    case 'DAY':
      return startOfDay(date);
    case 'WEEK':
      return startOfWeek(date);
    case 'MONTH':
      return startOfMonth(date);
    case 'YEAR':
      return startOfYear(date);
  }
};

const endOfUnit = (date: Date, unit: VariableDateViewFilterValueUnit) => {
  switch (unit) {
    case 'DAY':
      return endOfDay(date);
    case 'WEEK':
      return endOfWeek(date);
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
  const { direction, amount, unit, referenceDayAsString, timezone } =
    relativeDateFilter;

  const referenceDate = roundToNearestMinutes(new TZDate());

  console.log({
    direction,
    amount,
    unit,
    referenceDayAsString,
    timezone,
    referenceDate,
  });

  switch (direction) {
    case 'NEXT':
      if (amount === undefined) throw new Error('Amount is required');
      return {
        start: referenceDate,
        end: addUnit(referenceDate, amount, unit),
        ...relativeDateFilter,
      };
    case 'PAST':
      if (amount === undefined) throw new Error('Amount is required');
      return {
        start: subUnit(referenceDate, amount, unit),
        end: referenceDate,
        ...relativeDateFilter,
      };
    case 'THIS':
      console.log({
        start: startOfUnit(referenceDate, unit),
        end: endOfUnit(referenceDate, unit),
        ...relativeDateFilter,
      });
      return {
        start: startOfUnit(referenceDate, unit),
        end: endOfUnit(referenceDate, unit),
        ...relativeDateFilter,
      };
  }
};

const resolveVariableDateViewFilterValue = (value?: string | null) => {
  if (!value) return null;

  const relativeDate = variableDateViewFilterValueSchema.parse(value);

  const returnedRange =
    resolveVariableDateViewFilterValueFromRelativeDate(relativeDate);

  if (isDefined(relativeDate.timezone)) {
    const timezoneDifferenceMinutes = (
      tzA: string,
      tzB: string,
      date = new Date(),
    ) => {
      const offsetA = tzOffset(tzA, date); // minutes from UTC for tzA
      const offsetB = tzOffset(tzB, date); // minutes from UTC for tzB
      // To get difference: how many minutes B is ahead of A
      return offsetB - offsetA;
    };

    const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const diffInMinutes = timezoneDifferenceMinutes(
      relativeDate.timezone,
      systemTimeZone,
      returnedRange.start,
    );

    const startDateSure = new TZDate(returnedRange.start).withTimeZone(
      relativeDate.timezone,
    );

    const shiftedStartDate = addMinutes(returnedRange.start, diffInMinutes);
    const shiftedEndDate = addMinutes(returnedRange.end, diffInMinutes);

    console.log({
      returnedRange,
      startDateSure,
      shiftedStartDate,
      shiftedEndDate,
    });

    // const endDateSure = new TZDate(returnedRange.end).withTimeZone(
    //   systemTimeZone,
    // );

    // const shiftedEndDate = new TZDate(
    //   endDateSure.getFullYear(),
    //   endDateSure.getMonth(),
    //   endDateSure.getDate(),
    //   endDateSure.getHours(),
    //   endDateSure.getMinutes(),
    //   endDateSure.getSeconds(),
    //   relativeDate.timezone,
    // );

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
