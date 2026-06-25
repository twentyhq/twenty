import { isNonEmptyString } from '@sniptt/guards';
import {
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfMonth,
  endOfQuarter,
  endOfSecond,
  endOfWeek,
  endOfYear,
  isBefore,
  isWithinInterval,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfQuarter,
  startOfSecond,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import {
  addUnitToDateTime,
  assertUnreachable,
  getFirstDayOfTheWeekAsANumberForDateFNS,
  isDefined,
  type RelativeDateFilter,
  safeParseRelativeDateFilterJsonStringified,
  subUnitFromDateTime,
} from 'twenty-shared/utils';

// TODO: Merge this logic with resolveRelativeDateFilter in twenty-shared
// But it is not urgent since we force all workflow filters to be in UTC
export const parseAndEvaluateRelativeDateFilter = ({
  dateToCheck,
  relativeDateString,
}: {
  dateToCheck: Date;
  relativeDateString: string;
}): boolean => {
  const relativeDateFilterValue =
    safeParseRelativeDateFilterJsonStringified(relativeDateString);

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
  relativeDateFilterValue: RelativeDateFilter;
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

const resolveWeekStartsOn = (relativeDateFilterValue: RelativeDateFilter) =>
  isNonEmptyString(relativeDateFilterValue.firstDayOfTheWeek)
    ? getFirstDayOfTheWeekAsANumberForDateFNS(
        relativeDateFilterValue.firstDayOfTheWeek,
      )
    : 1;

const getPeriodStartForDateFns = (
  date: Date,
  relativeDateFilterValue: RelativeDateFilter,
): Date => {
  switch (relativeDateFilterValue.unit) {
    case 'SECOND':
      return startOfSecond(date);
    case 'MINUTE':
      return startOfMinute(date);
    case 'HOUR':
      return startOfHour(date);
    case 'DAY':
      return startOfDay(date);
    case 'WEEK':
      return startOfWeek(date, {
        weekStartsOn: resolveWeekStartsOn(relativeDateFilterValue),
      });
    case 'MONTH':
      return startOfMonth(date);
    case 'QUARTER':
      return startOfQuarter(date);
    case 'YEAR':
      return startOfYear(date);
    default:
      return assertUnreachable(relativeDateFilterValue.unit);
  }
};

const getNextPeriodStartForDateFns = (
  date: Date,
  relativeDateFilterValue: RelativeDateFilter,
): Date | undefined =>
  addUnitToDateTime(
    getPeriodStartForDateFns(date, relativeDateFilterValue),
    1,
    relativeDateFilterValue.unit,
  );

// Half-open [start, end): the period end is exclusive (it is the start of the
// next period), matching the shared resolver and preventing a value that lands
// exactly on a boundary (e.g. a date-only field at midnight) from being counted
// in two adjacent periods.
const isWithinHalfOpenInterval = (
  date: Date,
  start: Date,
  end: Date,
): boolean => !isBefore(date, start) && isBefore(date, end);

const evaluateNextDirection = (
  dateToCheck: Date,
  relativeDateFilterValue: RelativeDateFilter,
  now: Date,
): boolean => {
  if (!isDefined(relativeDateFilterValue.amount)) {
    return false;
  }

  const { amount, unit } = relativeDateFilterValue;

  const startOfNextPeriod = getNextPeriodStartForDateFns(
    now,
    relativeDateFilterValue,
  );

  if (!isDefined(startOfNextPeriod)) {
    return false;
  }

  const endOfPeriod = addUnitToDateTime(startOfNextPeriod, amount, unit);

  if (!isDefined(endOfPeriod)) {
    return false;
  }

  return isWithinHalfOpenInterval(dateToCheck, startOfNextPeriod, endOfPeriod);
};

function evaluatePastDirection(
  dateToCheck: Date,
  relativeDateFilterValue: RelativeDateFilter,
  now: Date,
): boolean {
  if (!isDefined(relativeDateFilterValue.amount)) {
    return false;
  }

  const { amount, unit } = relativeDateFilterValue;

  const startOfCurrentPeriod = getPeriodStartForDateFns(
    now,
    relativeDateFilterValue,
  );

  const startOfPeriod = subUnitFromDateTime(startOfCurrentPeriod, amount, unit);

  if (!isDefined(startOfPeriod)) {
    return false;
  }

  return isWithinHalfOpenInterval(
    dateToCheck,
    startOfPeriod,
    startOfCurrentPeriod,
  );
}

function evaluateThisDirection(
  dateToCheck: Date,
  relativeDateValue: RelativeDateFilter,
  now: Date,
): boolean {
  const { unit } = relativeDateValue;

  const firstDayOfTheWeekAsANumberForDateFNS =
    resolveWeekStartsOn(relativeDateValue);

  switch (unit) {
    case 'SECOND':
      return isWithinInterval(dateToCheck, {
        start: startOfSecond(now),
        end: endOfSecond(now),
      });
    case 'MINUTE':
      return isWithinInterval(dateToCheck, {
        start: startOfMinute(now),
        end: endOfMinute(now),
      });
    case 'HOUR':
      return isWithinInterval(dateToCheck, {
        start: startOfHour(now),
        end: endOfHour(now),
      });
    case 'DAY':
      return isWithinInterval(dateToCheck, {
        start: startOfDay(now),
        end: endOfDay(now),
      });
    case 'WEEK':
      return isWithinInterval(dateToCheck, {
        start: startOfWeek(now, {
          weekStartsOn: firstDayOfTheWeekAsANumberForDateFNS,
        }),
        end: endOfWeek(now, {
          weekStartsOn: firstDayOfTheWeekAsANumberForDateFNS,
        }),
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
    case 'QUARTER':
      return isWithinInterval(dateToCheck, {
        start: startOfQuarter(now),
        end: endOfQuarter(now),
      });
    default:
      return assertUnreachable(unit);
  }
}
