import { isPlainObject } from 'twenty-shared/utils';

import type {
  DatabaseEventTriggerRecordCondition,
  DatabaseEventTriggerRecordConditionOperand,
} from 'twenty-shared/application';

import { matchesLikePattern } from 'src/engine/workspace-event-emitter/utils/matches-like-pattern.util';

const UNKNOWN = null;

type ConditionOutcome = boolean | typeof UNKNOWN;

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

const allOf = (outcomes: ConditionOutcome[]): ConditionOutcome => {
  if (outcomes.some((outcome) => outcome === false)) {
    return false;
  }

  return outcomes.some((outcome) => outcome === UNKNOWN) ? UNKNOWN : true;
};

const anyOf = (outcomes: ConditionOutcome[]): ConditionOutcome => {
  if (outcomes.some((outcome) => outcome === true)) {
    return true;
  }

  return outcomes.some((outcome) => outcome === UNKNOWN) ? UNKNOWN : false;
};

const negate = (outcome: ConditionOutcome): ConditionOutcome =>
  outcome === UNKNOWN ? UNKNOWN : !outcome;

const evaluateOperator = (
  value: unknown,
  operator: string,
  expected: unknown,
): ConditionOutcome => {
  if (operator === 'is') {
    return expected === 'NULL' ? isNullish(value) : !isNullish(value);
  }

  if (isNullish(value) || isNullish(expected)) {
    return UNKNOWN;
  }

  switch (operator) {
    case 'eq':
      return value === expected;
    case 'neq':
      return value !== expected;
    case 'in':
      return Array.isArray(expected) && expected.includes(value);
    case 'gt':
      return isComparable(value) && isComparable(expected) && value > expected;
    case 'gte':
      return isComparable(value) && isComparable(expected) && value >= expected;
    case 'lt':
      return isComparable(value) && isComparable(expected) && value < expected;
    case 'lte':
      return isComparable(value) && isComparable(expected) && value <= expected;
    case 'like':
      return (
        typeof value === 'string' &&
        typeof expected === 'string' &&
        matchesLikePattern({
          value,
          pattern: expected,
          caseInsensitive: false,
        })
      );
    case 'ilike':
      return (
        typeof value === 'string' &&
        typeof expected === 'string' &&
        matchesLikePattern({ value, pattern: expected, caseInsensitive: true })
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
};

const evaluateOperand = (
  value: unknown,
  operand: DatabaseEventTriggerRecordConditionOperand,
): ConditionOutcome =>
  allOf(
    Object.entries(operand).map(([operator, expected]) =>
      evaluateOperator(value, operator, expected),
    ),
  );

const readField = (record: unknown, fieldName: string): unknown =>
  isPlainObject(record) ? record[fieldName] : undefined;

const evaluateCondition = (
  record: unknown,
  condition: Record<string, unknown>,
): ConditionOutcome =>
  allOf(
    Object.entries(condition).map(([key, value]): ConditionOutcome => {
      if (key === 'and') {
        return Array.isArray(value)
          ? allOf(value.map((child) => evaluateChild(record, child)))
          : false;
      }

      if (key === 'or') {
        return Array.isArray(value)
          ? anyOf(value.map((child) => evaluateChild(record, child)))
          : false;
      }

      if (key === 'not') {
        return negate(evaluateChild(record, value));
      }

      const fieldValue = readField(record, key);

      if (isOperand(value)) {
        return evaluateOperand(fieldValue, value);
      }

      return evaluateChild(fieldValue, value);
    }),
  );

const evaluateChild = (record: unknown, child: unknown): ConditionOutcome =>
  isPlainObject(child) ? evaluateCondition(record, child) : false;

export const evaluateDatabaseEventTriggerRecordCondition = ({
  record,
  condition,
}: {
  record: unknown;
  condition: DatabaseEventTriggerRecordCondition;
}): boolean => evaluateCondition(record, condition) === true;
