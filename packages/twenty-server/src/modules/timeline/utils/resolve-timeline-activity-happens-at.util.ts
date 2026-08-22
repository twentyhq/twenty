import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type TimestampedRecord = {
  createdAt?: unknown;
  updatedAt?: unknown;
};

const parseTimestamp = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const resolveTimelineActivityHappensAt = (
  event: ObjectRecordBaseEvent,
): Date => {
  const record = (event.properties.after ?? event.properties.before) as
    | TimestampedRecord
    | undefined;
  const recordTimestamp = parseTimestamp(
    record?.updatedAt ?? record?.createdAt,
  );

  return isDefined(recordTimestamp) ? recordTimestamp : new Date();
};
