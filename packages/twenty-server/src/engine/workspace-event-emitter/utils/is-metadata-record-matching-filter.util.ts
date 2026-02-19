import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type MetadataFilter = Record<string, unknown>;

type MetadataScalarFilter = {
  is?: 'NULL' | 'NOT_NULL';
  eq?: unknown;
  neq?: unknown;
  in?: unknown[];
  like?: string;
  ilike?: string;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
};

const isEmptyFilter = (filter: MetadataFilter): boolean =>
  Object.keys(filter).length === 0;

const isAndFilter = (filter: MetadataFilter): boolean =>
  'and' in filter && isDefined(filter.and);

const isOrFilter = (filter: MetadataFilter): boolean =>
  'or' in filter && isDefined(filter.or);

const isNotFilter = (filter: MetadataFilter): boolean =>
  'not' in filter && isDefined(filter.not);

const isImplicitAndFilter = (filter: MetadataFilter): boolean =>
  Object.keys(filter).length > 1;

const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const isMetadataRecordMatchingFilter = ({
  record,
  filter,
}: {
  record: Record<string, unknown>;
  filter: MetadataFilter;
}): boolean => {
  if (isEmptyFilter(filter)) {
    return true;
  }

  if (isImplicitAndFilter(filter)) {
    return Object.entries(filter).every(([key, value]) =>
      isMetadataRecordMatchingFilter({
        record,
        filter: { [key]: value },
      }),
    );
  }

  if (isAndFilter(filter)) {
    const andValue = filter.and;

    if (!Array.isArray(andValue)) {
      throw new Error(
        'Unexpected value for "and" filter: ' + JSON.stringify(andValue),
      );
    }

    return (
      andValue.length === 0 ||
      andValue.every((subFilter: MetadataFilter) =>
        isMetadataRecordMatchingFilter({ record, filter: subFilter }),
      )
    );
  }

  if (isOrFilter(filter)) {
    const orValue = filter.or;

    if (Array.isArray(orValue)) {
      return (
        orValue.length === 0 ||
        orValue.some((subFilter: MetadataFilter) =>
          isMetadataRecordMatchingFilter({ record, filter: subFilter }),
        )
      );
    }

    if (isObject(orValue)) {
      return isMetadataRecordMatchingFilter({
        record,
        filter: orValue as MetadataFilter,
      });
    }

    throw new Error(
      'Unexpected value for "or" filter: ' + JSON.stringify(orValue),
    );
  }

  if (isNotFilter(filter)) {
    const notValue = filter.not;

    if (isObject(notValue) && isEmptyFilter(notValue as MetadataFilter)) {
      return true;
    }

    return !isMetadataRecordMatchingFilter({
      record,
      filter: notValue as MetadataFilter,
    });
  }

  return Object.entries(filter).every(([fieldName, fieldFilter]) => {
    if (!isDefined(fieldFilter) || !isObject(fieldFilter)) {
      return true;
    }

    const recordValue = record[fieldName];

    return isScalarValueMatchingFilter(
      recordValue,
      fieldFilter as MetadataScalarFilter,
    );
  });
};

const isScalarValueMatchingFilter = (
  value: unknown,
  fieldFilter: MetadataScalarFilter,
): boolean => {
  if ('is' in fieldFilter) {
    if (fieldFilter.is === 'NULL') {
      return !isDefined(value);
    }

    return isDefined(value);
  }

  if ('eq' in fieldFilter) {
    return value === fieldFilter.eq;
  }

  if ('neq' in fieldFilter) {
    return value !== fieldFilter.neq;
  }

  if ('in' in fieldFilter) {
    if (!Array.isArray(fieldFilter.in)) {
      return false;
    }

    return fieldFilter.in.includes(value);
  }

  if ('like' in fieldFilter) {
    if (typeof value !== 'string') {
      return false;
    }

    const pattern = String(fieldFilter.like)
      .split('%')
      .map(escapeRegExp)
      .join('.*');

    return new RegExp(`^${pattern}$`).test(value);
  }

  if ('ilike' in fieldFilter) {
    if (typeof value !== 'string') {
      return false;
    }

    const pattern = String(fieldFilter.ilike)
      .split('%')
      .map(escapeRegExp)
      .join('.*');

    return new RegExp(`^${pattern}$`, 'i').test(value);
  }

  if ('gt' in fieldFilter) {
    return isDefined(value) && (value as number) > (fieldFilter.gt as number);
  }

  if ('gte' in fieldFilter) {
    return isDefined(value) && (value as number) >= (fieldFilter.gte as number);
  }

  if ('lt' in fieldFilter) {
    return isDefined(value) && (value as number) < (fieldFilter.lt as number);
  }

  if ('lte' in fieldFilter) {
    return isDefined(value) && (value as number) <= (fieldFilter.lte as number);
  }

  throw new Error(
    'Unsupported filter operator: ' + JSON.stringify(fieldFilter),
  );
};
