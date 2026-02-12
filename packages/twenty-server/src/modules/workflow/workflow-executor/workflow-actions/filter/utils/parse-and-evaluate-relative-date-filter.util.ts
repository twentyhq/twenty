import { isNonEmptyString } from '@sniptt/guards';
import {
  endOfDay,
  endOfHour,
  endOfMinute,
  endOfMonth,
  endOfSecond,
  endOfWeek,
  endOfYear,
  isWithinInterval,
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfMonth,
  startOfSecond,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import {
  addUnitToDateTime,
  getFirstDayOfTheWeekAsANumberForDateFNS,
  isDefined,
  type RelativeDateFilter,
  safeParseRelativeDateFilterJSONStringified,
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
    safeParseRelativeDateFilterJSONStringified(relativeDateString);

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

const evaluateNextDirection = (
  dateToCheck: Date,
  relativeDateFilterValue: RelativeDateFilter,
  now: Date,
): boolean => {
  if (!isDefined(relativeDateFilterValue.amount)) {
    return false;
  }

  const { amount, unit } = relativeDateFilterValue;

  const endOfPeriod = addUnitToDateTime(now, amount, unit);

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
  relativeDateFilterValue: RelativeDateFilter,
  now: Date,
): boolean {
  if (!isDefined(relativeDateFilterValue.amount)) {
    return false;
  }

  const { amount, unit } = relativeDateFilterValue;

  const startOfPeriod = subUnitFromDateTime(now, amount, unit);

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
  relativeDateValue: RelativeDateFilter,
  now: Date,
): boolean {
  const { unit } = relativeDateValue;

  const firstDayOfTheWeekAsANumberForDateFNS = isNonEmptyString(
    relativeDateValue.firstDayOfTheWeek,
  )
    ? getFirstDayOfTheWeekAsANumberForDateFNS(
        relativeDateValue.firstDayOfTheWeek,
      )
    : 1;

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
    default:
      return false;
  }
}
