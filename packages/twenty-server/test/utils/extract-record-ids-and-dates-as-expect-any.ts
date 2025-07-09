import { isDefined } from 'twenty-shared/utils';

export const extractRecordIdsAndDatesAsExpectAny = (
  record: Record<string, unknown>,
): any => {
  if (Array.isArray(record)) {
    return record.map(extractRecordIdsAndDatesAsExpectAny);
  }

  return Object.entries(record).reduce((acc, [key, value]) => {
    if (!isDefined(value)) {
      return acc;
    }

    if (key.endsWith('Id') || key === 'id') {
      return {
        ...acc,
        [key]: expect.any(String),
      };
    }

    if (value instanceof Date) {
      return {
        ...acc,
        [key]: expect.any(Date),
      };
    }

    if (typeof value === 'object' || Array.isArray(value)) {
      return {
        ...acc,
        [key]: extractRecordIdsAndDatesAsExpectAny(
          value as Record<string, unknown>,
        ),
      };
    }
    return acc;
  }, {});
};
