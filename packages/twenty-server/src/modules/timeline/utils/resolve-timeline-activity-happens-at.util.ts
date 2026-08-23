import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

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

const getRecordTimestamp = (record: object | undefined): unknown => {
  if (!isDefined(record)) {
    return undefined;
  }

  const updatedAt = 'updatedAt' in record ? record.updatedAt : undefined;

  return updatedAt ?? ('createdAt' in record ? record.createdAt : undefined);
};

export const resolveTimelineActivityHappensAt = (
  event: ObjectRecordBaseEvent,
): Date => {
  const record = event.properties.after ?? event.properties.before;
  const recordTimestamp = parseTimestamp(getRecordTimestamp(record));

  return isDefined(recordTimestamp) ? recordTimestamp : new Date();
};
