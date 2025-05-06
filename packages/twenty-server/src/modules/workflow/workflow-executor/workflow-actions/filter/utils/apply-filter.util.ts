import { FilterCondition } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/filter-condition.type';
import { FilterOperator } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/filter-operator.type';

export const applyFilter = <T extends Record<string, any>>(
  array: T[],
  filter: FilterCondition | FilterCondition[],
): T[] => {
  if (Array.isArray(filter)) {
    return array.filter((item) => {
      return filter.every((condition) => evaluateFilter(item, condition));
    });
  }

  return array.filter((item) => evaluateFilter(item, filter));
};

const evaluateFilter = (
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

  if ('not' in filter) {
    if (!filter.not) {
      return false;
    }

    return !evaluateFilter(item, filter.not);
  }

  for (const field in filter) {
    const conditions = filter[field];

    if (['and', 'or', 'not'].includes(field)) {
      continue;
    }

    if (isOperator(conditions)) {
      const value = getNestedProperty(item, field);

      if (!evaluateCondition(value, conditions as FilterOperator)) {
        return false;
      }
    } else {
      const nestedValue = getNestedProperty(item, field);

      if (
        nestedValue === undefined &&
        !hasNullCheck(conditions as FilterCondition)
      ) {
        return false;
      }
      if (
        !evaluateNestedConditions(nestedValue, conditions as FilterCondition)
      ) {
        return false;
      }
    }
  }

  return true;
};

const hasNullCheck = (conditions: FilterCondition): boolean => {
  const operator = conditions as FilterOperator;

  if ('is' in operator && operator.is === 'NULL') {
    return true;
  }

  for (const key in conditions) {
    if (typeof conditions[key] === 'object' && conditions[key] !== null) {
      if (hasNullCheck(conditions[key] as FilterCondition)) {
        return true;
      }
    }
  }

  return false;
};

const evaluateNestedConditions = (
  value: any,
  conditions: FilterCondition,
): boolean => {
  const operator = conditions as FilterOperator;

  if ('is' in operator && operator.is === 'NULL') {
    return value === null || value === undefined;
  }

  if (value === null || value === undefined) {
    return false;
  }

  for (const field in conditions) {
    const nestedConditions = conditions[field];

    if (isOperator(nestedConditions)) {
      const nestedValue = getNestedProperty(value, field);

      if (!evaluateCondition(nestedValue, nestedConditions as FilterOperator)) {
        return false;
      }
    } else {
      const nestedValue = getNestedProperty(value, field);

      if (
        !evaluateNestedConditions(
          nestedValue,
          nestedConditions as FilterCondition,
        )
      ) {
        return false;
      }
    }
  }

  return true;
};

const isOperator = (obj: any): boolean => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const operatorKeys = [
    'eq',
    'ne',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'ilike',
    'in',
    'between',
    'isNull',
    'is',
  ];

  return operatorKeys.some((op) => op in obj);
};

const evaluateCondition = (value: any, condition: FilterOperator): boolean => {
  for (const operator in condition) {
    const targetValue = condition[operator as keyof FilterOperator];

    switch (operator) {
      case 'eq':
        if (value != targetValue) return false;
        break;
      case 'ne':
        if (value == targetValue) return false;
        break;
      case 'gt':
        if (!(value > targetValue)) return false;
        break;
      case 'gte':
        if (!(value >= targetValue)) return false;
        break;
      case 'lt':
        if (!(value < targetValue)) return false;
        break;
      case 'lte':
        if (!(value <= targetValue)) return false;
        break;
      case 'like':
        if (!matchesLike(value, targetValue as string)) return false;
        break;
      case 'ilike':
        if (!matchesILike(value, targetValue as string)) return false;
        break;
      case 'in':
        if (!Array.isArray(targetValue) || !targetValue.includes(value))
          return false;
        break;
      case 'between':
        if (Array.isArray(targetValue) && targetValue.length === 2) {
          if (!(value >= targetValue[0] && value <= targetValue[1]))
            return false;
        }
        break;
      case 'isNull': {
        const isNull = value === null || value === undefined;

        if (isNull !== targetValue) return false;
        break;
      }
      case 'is':
        if (targetValue === 'NULL') {
          if (value !== null && value !== undefined) return false;
        } else {
          if (value != targetValue) return false;
        }
        break;
      default:
        return false;
    }
  }

  return true;
};

const matchesLike = (value: any, pattern: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const regexPattern = pattern.replace(/%/g, '.*').replace(/_/g, '.');
  const regex = new RegExp(`^${regexPattern}$`);

  return regex.test(value);
};

const matchesILike = (value: any, pattern: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  const regexPattern = pattern.replace(/%/g, '.*').replace(/_/g, '.');
  const regex = new RegExp(`^${regexPattern}$`, 'i');

  return regex.test(value);
};

const getNestedProperty = (obj: Record<string, any>, path: string): any => {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  return obj[path];
};
