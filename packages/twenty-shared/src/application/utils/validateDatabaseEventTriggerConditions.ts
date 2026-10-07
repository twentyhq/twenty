import { DATABASE_EVENT_TRIGGER_CONDITION_LIMITS } from '@/application/constants/DatabaseEventTriggerConditionLimits';
import { isWorkspaceSignalName } from '@/application/utils/isWorkspaceSignalName';
import { isDatabaseEventActorType } from '@/database-events/database-event-actor-type';
import { isDefined } from '@/utils/validation/isDefined';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const CONDITION_KEYS = ['actor', 'record', 'signals', 'onMismatch'] as const;
const ON_MISMATCH_VALUES = ['drop', 'deferUntilMatch'] as const;
const LOGICAL_KEYS = ['and', 'or', 'not'] as const;
const FIELD_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

const OPERAND_VALIDATORS: Record<string, (value: unknown) => boolean> = {
  eq: (value) => value !== undefined,
  neq: (value) => value !== undefined,
  in: (value) => Array.isArray(value),
  is: (value) => value === 'NULL' || value === 'NOT_NULL',
  gt: (value) => typeof value === 'string' || typeof value === 'number',
  gte: (value) => typeof value === 'string' || typeof value === 'number',
  lt: (value) => typeof value === 'string' || typeof value === 'number',
  lte: (value) => typeof value === 'string' || typeof value === 'number',
  like: (value) => typeof value === 'string',
  ilike: (value) => typeof value === 'string',
  startsWith: (value) => typeof value === 'string',
};

const isOperatorKey = (key: string): boolean => key in OPERAND_VALIDATORS;

const isLogicalKey = (key: string): boolean =>
  (LOGICAL_KEYS as readonly string[]).includes(key);

const hasConcreteObjectName = (eventName: string): boolean =>
  !eventName.startsWith('*');

type RecordConditionWalk = {
  errors: string[];
  leafCount: number;
};

const validateOperand = (
  fieldPath: string,
  operand: Record<string, unknown>,
  walk: RecordConditionWalk,
): void => {
  walk.leafCount += 1;

  for (const [operator, value] of Object.entries(operand)) {
    const isValid = OPERAND_VALIDATORS[operator];

    if (!isDefined(isValid)) {
      walk.errors.push(
        `record condition on "${fieldPath}" uses unknown operator "${operator}"`,
      );
      continue;
    }

    if ((operator === 'eq' || operator === 'neq') && value === null) {
      walk.errors.push(
        `record condition on "${fieldPath}" compares "${operator}" with null, use "is" instead`,
      );
      continue;
    }

    if (!isValid(value)) {
      walk.errors.push(
        `record condition on "${fieldPath}" has an invalid value for "${operator}"`,
      );
    }
  }
};

const validateRecordCondition = (
  condition: unknown,
  path: string,
  depth: number,
  walk: RecordConditionWalk,
): void => {
  if (
    depth > DATABASE_EVENT_TRIGGER_CONDITION_LIMITS.MAX_RECORD_CONDITION_DEPTH
  ) {
    walk.errors.push(
      `record condition at "${path}" is nested deeper than ${DATABASE_EVENT_TRIGGER_CONDITION_LIMITS.MAX_RECORD_CONDITION_DEPTH} levels`,
    );

    return;
  }

  if (!isPlainObject(condition) || Object.keys(condition).length === 0) {
    walk.errors.push(
      `record condition at "${path}" must be a non-empty object`,
    );

    return;
  }

  for (const [key, value] of Object.entries(condition)) {
    const childPath = path === '' ? key : `${path}.${key}`;

    if (key === 'and' || key === 'or') {
      if (!Array.isArray(value) || value.length === 0) {
        walk.errors.push(
          `record condition "${childPath}" must be a non-empty array`,
        );
        continue;
      }

      for (const [index, child] of value.entries()) {
        validateRecordCondition(
          child,
          `${childPath}[${index}]`,
          depth + 1,
          walk,
        );
      }
      continue;
    }

    if (key === 'not') {
      validateRecordCondition(value, childPath, depth + 1, walk);
      continue;
    }

    if (!FIELD_NAME_PATTERN.test(key)) {
      walk.errors.push(
        `record condition field "${childPath}" is not a valid field name`,
      );
      continue;
    }

    if (!isPlainObject(value) || Object.keys(value).length === 0) {
      walk.errors.push(
        `record condition on "${childPath}" must be an operand or a nested condition`,
      );
      continue;
    }

    const keys = Object.keys(value);
    const operatorKeys = keys.filter(isOperatorKey);
    const logicalKey = keys.find(isLogicalKey);

    if (isDefined(logicalKey)) {
      walk.errors.push(
        `record condition on "${childPath}" uses "${logicalKey}" inside a field, combine whole field conditions instead`,
      );
      continue;
    }

    if (operatorKeys.length === 0) {
      const unknownOperator = Object.entries(value).find(
        ([, childValue]) => !isPlainObject(childValue),
      )?.[0];

      if (isDefined(unknownOperator)) {
        walk.errors.push(
          `record condition on "${childPath}" uses unknown operator "${unknownOperator}"`,
        );
        continue;
      }

      validateRecordCondition(value, childPath, depth + 1, walk);
      continue;
    }

    if (operatorKeys.length !== keys.length) {
      walk.errors.push(
        `record condition on "${childPath}" mixes operators and field names`,
      );
      continue;
    }

    validateOperand(childPath, value, walk);
  }
};

export const validateDatabaseEventTriggerConditions = ({
  eventName,
  conditions,
}: {
  eventName: string;
  conditions: unknown;
}): string[] => {
  if (!isPlainObject(conditions)) {
    return ['conditions must be an object'];
  }

  const errors: string[] = [];

  for (const key of Object.keys(conditions)) {
    if (!(CONDITION_KEYS as readonly string[]).includes(key)) {
      errors.push(`conditions has unknown key "${key}"`);
    }
  }

  const { actor, record, signals, onMismatch } = conditions;

  if (actor !== undefined) {
    if (!Array.isArray(actor) || actor.length === 0) {
      errors.push('conditions.actor must be a non-empty array');
    } else {
      for (const actorType of actor) {
        if (!isDatabaseEventActorType(actorType)) {
          errors.push(
            `conditions.actor has unknown actor type "${String(actorType)}"`,
          );
        }
      }

      if (new Set(actor).size !== actor.length) {
        errors.push('conditions.actor lists an actor type twice');
      }
    }
  }

  if (record !== undefined) {
    if (!hasConcreteObjectName(eventName)) {
      errors.push(
        'conditions.record needs an event name with a concrete object, not a wildcard',
      );
    }

    const walk: RecordConditionWalk = { errors: [], leafCount: 0 };

    validateRecordCondition(record, '', 1, walk);
    errors.push(...walk.errors);

    if (
      walk.leafCount >
      DATABASE_EVENT_TRIGGER_CONDITION_LIMITS.MAX_RECORD_CONDITION_LEAVES
    ) {
      errors.push(
        `conditions.record has more than ${DATABASE_EVENT_TRIGGER_CONDITION_LIMITS.MAX_RECORD_CONDITION_LEAVES} field conditions`,
      );
    }
  }

  const hasSignals = isPlainObject(signals) && Object.keys(signals).length > 0;

  if (signals !== undefined) {
    if (!hasSignals) {
      errors.push('conditions.signals must be a non-empty object');
    } else {
      for (const [signalName, expected] of Object.entries(signals)) {
        if (!isWorkspaceSignalName(signalName)) {
          errors.push(`conditions.signals has unknown signal "${signalName}"`);
        }

        if (typeof expected !== 'boolean') {
          errors.push(`conditions.signals["${signalName}"] must be a boolean`);
        }
      }
    }
  }

  if (onMismatch !== undefined) {
    if (!(ON_MISMATCH_VALUES as readonly unknown[]).includes(onMismatch)) {
      errors.push(
        `conditions.onMismatch must be one of ${ON_MISMATCH_VALUES.join(', ')}`,
      );
    } else if (onMismatch === 'deferUntilMatch') {
      if (!hasSignals) {
        errors.push(
          'conditions.onMismatch "deferUntilMatch" needs conditions.signals',
        );
      }

      if (!hasConcreteObjectName(eventName)) {
        errors.push(
          'conditions.onMismatch "deferUntilMatch" needs an event name with a concrete object, not a wildcard',
        );
      }
    }
  }

  return errors;
};
