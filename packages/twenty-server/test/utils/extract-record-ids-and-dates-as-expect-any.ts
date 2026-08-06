import { isDefined } from 'twenty-shared/utils';

type ExtractRecordIdsAndDatesAsExpectAnyOptions = {
  // Keys left out of the matcher so their literal values are snapshotted,
  // e.g. derived universal identifiers that are constant across workspaces.
  keepLiteralKeys?: string[];
};

export const extractRecordIdsAndDatesAsExpectAny = (
  record: Record<string, unknown> | Array<Record<string, unknown>>,
  options: ExtractRecordIdsAndDatesAsExpectAnyOptions = {},
): any => {
  if (Array.isArray(record)) {
    return record.map((item) =>
      extractRecordIdsAndDatesAsExpectAny(item, options),
    );
  }

  if (typeof record !== 'object') {
    return record;
  }

  return Object.entries(record).reduce((acc, [key, value]) => {
    if (!isDefined(value)) {
      return acc;
    }

    if (options.keepLiteralKeys?.includes(key)) {
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
      key.endsWith('UniversalIdentifier') ||
      key === 'universalIdentifier' ||
      key === 'id' ||
      key === 'updatedAt' ||
      key === 'deletedAt' ||
      key === 'createdAt'
    ) {
      return {
        ...acc,
        [key]:
          typeof value === 'object' ? expect.any(Object) : expect.any(String),
      };
    }

    if (typeof value === 'object' || Array.isArray(value)) {
      return {
        ...acc,
        [key]: extractRecordIdsAndDatesAsExpectAny(
          value as Record<string, unknown>,
          options,
        ),
      };
    }

    return acc;
  }, {});
};
