import { FilterCondition } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/filter-condition.type';
import { FilterOperator } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/filter-operator.type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyFilter = <T extends Record<string, any>>(
  array: T[],
  filter: FilterCondition,
): T[] => {
  return array.filter((item) => evaluateFilter(item, filter));
};

const evaluateFilter = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: Record<string, any>,
  filter: FilterCondition,
): boolean => {
  if ('and' in filter) {
    return (
      filter.and?.every((subFilter) => evaluateFilter(item, subFilter)) ?? false
    );
  }

  if ('or' in filter) {
    return (
      filter.or?.some((subFilter) => evaluateFilter(item, subFilter)) ?? false
    );
  }

  if ('not' in filter && filter.not) {
    return !evaluateFilter(item, filter.not);
  }

  return Object.entries(filter).every(([field, conditions]) => {
    const value = item[field];

    if (isOperator(conditions)) {
      return evaluateCondition(value, conditions as FilterOperator);
    }

    if (value === undefined && !hasNullCheck(conditions as FilterCondition)) {
      return false;
    }

    return evaluateNestedConditions(value, conditions as FilterCondition);
  });
};

const hasNullCheck = (conditions: FilterCondition): boolean => {
  const operator = conditions as FilterOperator;

  if ('is' in operator && operator.is === 'NULL') {
    return true;
  }

  return Object.values(conditions).some(
    (value) =>
      typeof value === 'object' &&
      value !== null &&
      hasNullCheck(value as FilterCondition),
  );
};

const evaluateNestedConditions = (
  value: unknown,
  conditions: FilterCondition,
): boolean => {
  const operator = conditions as FilterOperator;

  if ('is' in operator && operator.is === 'NULL') {
    return value === null || value === undefined;
  }

  if (value === null || value === undefined) {
    return false;
  }

  return Object.entries(conditions).every(([field, nestedConditions]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nestedValue = (value as Record<string, any>)[field];

    if (isOperator(nestedConditions)) {
      return evaluateCondition(nestedValue, nestedConditions as FilterOperator);
    }

    return evaluateNestedConditions(
      nestedValue,
      nestedConditions as FilterCondition,
    );
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const evaluateCondition = (value: any, condition: FilterOperator): boolean => {
  const [[operator, targetValue]] = Object.entries(condition);

  switch (operator) {
    case 'eq':
      return value === targetValue;

    case 'ne':
      return value !== targetValue;

    case 'gt':
      return value > targetValue;

    case 'gte':
      return value >= targetValue;

    case 'lt':
      return value < targetValue;

    case 'lte':
      return value <= targetValue;

    case 'like':
      return matchesLike(value, targetValue as string);

    case 'ilike':
      return matchesILike(value, targetValue as string);

    case 'in':
      if (!Array.isArray(targetValue)) return false;
      if (Array.isArray(value)) {
        return value.some((v) => targetValue.includes(v));
      }

      return targetValue.includes(value);

    case 'is':
      return targetValue === 'NULL'
        ? value === null || value === undefined
        : value === targetValue;

    default:
      return false;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const matchesLike = (value: any, pattern: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const regexPattern = pattern.replace(/%/g, '.*').replace(/_/g, '.');

  return new RegExp(`^${regexPattern}$`).test(value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const matchesILike = (value: any, pattern: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const regexPattern = pattern.replace(/%/g, '.*').replace(/_/g, '.');

  return new RegExp(`^${regexPattern}$`, 'i').test(value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isOperator = (obj: any): boolean => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  return [
    'eq',
    'ne',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'in',
    'is',
  ].some((op) => op in obj);
};
