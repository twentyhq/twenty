import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import {
  type VariableDateViewFilterValue,
  type VariableDateViewFilterValueUnit,
} from 'twenty-shared/types';
import { safeParseRelativeDateFilterValue } from 'twenty-shared/utils';

export const parseAndEvaluateRelativeDateFilter = ({
  dateToCheck,
  relativeDateString,
}: {
  dateToCheck: Date;
  relativeDateString: string;
}): boolean => {
  const relativeDateFilterValue =
    safeParseRelativeDateFilterValue(relativeDateString);

  if (!relativeDateFilterValue) {
    return false;
  }

  return evaluateRelativeDateFilter({
    dateToCheck,
    relativeDateFilterValue,
  });
};

export const evaluateRelativeDateFilter = ({
  dateToCheck,
  relativeDateFilterValue,
}: {
  dateToCheck: Date;
  relativeDateFilterValue: VariableDateViewFilterValue;
}): boolean => {
  const now = new Date();

  switch (relativeDateFilterValue.direction) {
    case 'NEXT':
      return evaluateNextDirection(dateToCheck, relativeDateFilterValue, now);
    case 'THIS':
      return evaluateThisDirection(dateToCheck, relativeDateFilterValue, now);
    case 'PAST':
      return evaluatePastDirection(dateToCheck, relativeDateFilterValue, now);
    default:
      return false;
  }
};

const evaluateNextDirection = (
  dateToCheck: Date,
  relativeDateFilterValue: VariableDateViewFilterValue,
  now: Date,
): boolean => {
  if (relativeDateFilterValue.amount === undefined) {
    return false;
  }

  const { amount, unit } = relativeDateFilterValue;

  const endOfPeriod = addUnitToDate(now, amount, unit);

  if (!endOfPeriod) {
    return false;
  }

  return isWithinInterval(dateToCheck, {
    start: now,
    end: endOfPeriod,
  });
};

function evaluatePastDirection(
  dateToCheck: Date,
  relativeDateFilterValue: VariableDateViewFilterValue,
  now: Date,
): boolean {
  if (relativeDateFilterValue.amount === undefined) {
    return false;
  }

  const { amount, unit } = relativeDateFilterValue;

  const startOfPeriod = subtractUnitFromDate(now, amount, unit);

  if (!startOfPeriod) {
    return false;
  }

  return isWithinInterval(dateToCheck, {
    start: startOfPeriod,
    end: now,
  });
}

function evaluateThisDirection(
  dateToCheck: Date,
  relativeDateValue: VariableDateViewFilterValue,
  now: Date,
): boolean {
  const { unit } = relativeDateValue;

  switch (unit) {
    case 'DAY':
      return isWithinInterval(dateToCheck, {
        start: startOfDay(now),
        end: endOfDay(now),
      });
    case 'WEEK':
      return isWithinInterval(dateToCheck, {
        start: startOfWeek(now),
        end: endOfWeek(now),
      });
    case 'MONTH':
      return isWithinInterval(dateToCheck, {
        start: startOfMonth(now),
        end: endOfMonth(now),
      });
    case 'YEAR':
      return isWithinInterval(dateToCheck, {
        start: startOfYear(now),
        end: endOfYear(now),
      });
    default:
      return false;
  }
}

function addUnitToDate(
  date: Date,
  amount: number,
  unit: VariableDateViewFilterValueUnit,
): Date | null {
  switch (unit) {
    case 'DAY':
      return addDays(date, amount);
    case 'WEEK':
      return addWeeks(date, amount);
    case 'MONTH':
      return addMonths(date, amount);
    case 'YEAR':
      return addYears(date, amount);
    default:
      return null;
  }
}

function subtractUnitFromDate(
  date: Date,
  amount: number,
  unit: VariableDateViewFilterValueUnit,
): Date | null {
  switch (unit) {
    case 'DAY':
      return subDays(date, amount);
    case 'WEEK':
      return subWeeks(date, amount);
    case 'MONTH':
      return subMonths(date, amount);
    case 'YEAR':
      return subYears(date, amount);
    default:
      return null;
  }
}
