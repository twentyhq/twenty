import { isDefined } from 'twenty-shared/utils';

export const extractRecordIdsAndDatesAsExpectAny = (
  record: Record<string, unknown> | Array<Record<string, unknown>>,
): any => {
  if (Array.isArray(record)) {
    return record.map(extractRecordIdsAndDatesAsExpectAny);
  }

  if (typeof record !== 'object') {
    return record;
  }

  return Object.entries(record).reduce((acc, [key, value]) => {
    if (!isDefined(value)) {
      return acc;
    }

    if (value instanceof Date) {
      return {
        ...acc,
        [key]: expect.any(Date),
      };
    }

    if (
      key.endsWith('Id') ||
      key === 'universalIdentifier' ||
      key === 'id' ||
      key === 'updatedAt' ||
      key === 'deletedAt' ||
      key === 'createdAt'
    ) {
      return {
        ...acc,
        [key]: expect.any(String),
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
