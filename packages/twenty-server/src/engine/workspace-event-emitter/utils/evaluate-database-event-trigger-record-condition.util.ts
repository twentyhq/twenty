import { isPlainObject } from 'twenty-shared/utils';

import type {
  DatabaseEventTriggerRecordCondition,
  DatabaseEventTriggerRecordConditionOperand,
} from 'twenty-shared/application';

const OPERATOR_KEYS = new Set([
  'eq',
  'neq',
  'in',
  'is',
  'gt',
  'gte',
  'lt',
  'lte',
  'like',
  'ilike',
  'startsWith',
]);

const isOperand = (
  value: unknown,
): value is DatabaseEventTriggerRecordConditionOperand =>
  isPlainObject(value) &&
  Object.keys(value).length > 0 &&
  Object.keys(value).every((key) => OPERATOR_KEYS.has(key));

const isNullish = (value: unknown): boolean =>
  value === null || value === undefined;

const isComparable = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

const likeToRegExp = (pattern: string, caseInsensitive: boolean): RegExp => {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*')
    .replace(/_/g, '.');

  return new RegExp(`^${escaped}$`, caseInsensitive ? 'is' : 's');
};

const evaluateOperand = (
  value: unknown,
  operand: DatabaseEventTriggerRecordConditionOperand,
): boolean =>
  Object.entries(operand).every(([operator, expected]) => {
    switch (operator) {
      case 'eq':
        return isNullish(expected) ? isNullish(value) : value === expected;
      case 'neq':
        return isNullish(expected) ? !isNullish(value) : value !== expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(value);
      case 'is':
        return expected === 'NULL' ? isNullish(value) : !isNullish(value);
      case 'gt':
        return (
          isComparable(value) && isComparable(expected) && value > expected
        );
      case 'gte':
        return (
          isComparable(value) && isComparable(expected) && value >= expected
        );
      case 'lt':
        return (
          isComparable(value) && isComparable(expected) && value < expected
        );
      case 'lte':
        return (
          isComparable(value) && isComparable(expected) && value <= expected
        );
      case 'like':
        return (
          typeof value === 'string' &&
          typeof expected === 'string' &&
          likeToRegExp(expected, false).test(value)
        );
      case 'ilike':
        return (
          typeof value === 'string' &&
          typeof expected === 'string' &&
          likeToRegExp(expected, true).test(value)
        );
      case 'startsWith':
        return (
          typeof value === 'string' &&
          typeof expected === 'string' &&
          value.startsWith(expected)
        );
      default:
        return false;
    }
  });

const readField = (record: unknown, fieldName: string): unknown =>
  isPlainObject(record) ? record[fieldName] : undefined;

export const evaluateDatabaseEventTriggerRecordCondition = (
  record: unknown,
  condition: DatabaseEventTriggerRecordCondition,
): boolean =>
  Object.entries(condition).every(([key, value]) => {
    if (key === 'and') {
      return (
        Array.isArray(value) &&
        value.every((child) =>
          evaluateDatabaseEventTriggerRecordCondition(record, child),
        )
      );
    }

    if (key === 'or') {
      return (
        Array.isArray(value) &&
        value.some((child) =>
          evaluateDatabaseEventTriggerRecordCondition(record, child),
        )
      );
    }

    if (key === 'not') {
      return (
        isPlainObject(value) &&
        !evaluateDatabaseEventTriggerRecordCondition(
          record,
          value as DatabaseEventTriggerRecordCondition,
        )
      );
    }

    const fieldValue = readField(record, key);

    if (isOperand(value)) {
      return evaluateOperand(fieldValue, value);
    }

    return (
      isPlainObject(value) &&
      evaluateDatabaseEventTriggerRecordCondition(
        fieldValue,
        value as DatabaseEventTriggerRecordCondition,
      )
    );
  });
