import { Temporal } from 'temporal-polyfill';
import {
  isDefined,
  type RelativeDateFilter,
  resolveRelativeDateTimeFilter,
  safeParseRelativeDateFilterJsonStringified,
} from 'twenty-shared/utils';

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
  if (
    relativeDateFilterValue.direction !== 'THIS' &&
    !isDefined(relativeDateFilterValue.amount)
  ) {
    return false;
  }

  const referenceZonedDateTime = Temporal.Instant.fromEpochMilliseconds(
    new Date().getTime(),
  ).toZonedDateTimeISO('UTC');

  const { start, end } = resolveRelativeDateTimeFilter(
    relativeDateFilterValue,
    referenceZonedDateTime,
  );

  const dateToCheckInstant = Temporal.Instant.fromEpochMilliseconds(
    dateToCheck.getTime(),
  );

  // Half-open [start, end): the period end is exclusive (it is the start of the
  // next period), so a value that lands exactly on a boundary is only counted in
  // one of two adjacent periods.
  return (
    Temporal.Instant.compare(dateToCheckInstant, start.toInstant()) >= 0 &&
    Temporal.Instant.compare(dateToCheckInstant, end.toInstant()) < 0
  );
};
