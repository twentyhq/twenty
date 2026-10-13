import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const toEpochMilliseconds = (value: string | Date | null | undefined) => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (!isNonEmptyString(value)) {
    return null;
  }

  const epochMilliseconds = Date.parse(value);

  return Number.isNaN(epochMilliseconds) ? null : epochMilliseconds;
};

export const isFetchedCalendarEventOlderThanStored = ({
  fetchedExternalUpdatedAt,
  storedExternalUpdatedAt,
}: {
  fetchedExternalUpdatedAt: string | null | undefined;
  storedExternalUpdatedAt: string | Date | null | undefined;
}): boolean => {
  const fetchedEpochMilliseconds = toEpochMilliseconds(
    fetchedExternalUpdatedAt,
  );
  const storedEpochMilliseconds = toEpochMilliseconds(storedExternalUpdatedAt);

  return (
    isDefined(fetchedEpochMilliseconds) &&
    isDefined(storedEpochMilliseconds) &&
    fetchedEpochMilliseconds < storedEpochMilliseconds
  );
};
