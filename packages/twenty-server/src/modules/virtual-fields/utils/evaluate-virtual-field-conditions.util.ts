import { FieldMetadataType } from 'twenty-shared/types';

import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { Operator } from 'src/modules/virtual-fields/types/Operator';
import { type PrimitiveValue } from 'src/modules/virtual-fields/types/PrimitiveValue';
import {
  type Condition,
  type ConditionalField,
  type FieldCondition,
  type LogicalCondition,
} from 'src/modules/virtual-fields/types/VirtualField';
import {
  getFieldMetadata,
  resolveField,
} from 'src/modules/virtual-fields/utils/metadata-resolver.util';

type RecordData = Record<string, PrimitiveValue | PrimitiveValue[]>;

export function evaluateConditionalField(
  conditionalField: ConditionalField,
  recordData: RecordData,
  objectMetadataMaps: ObjectMetadataMaps,
): PrimitiveValue {
  try {
    for (const whenClause of conditionalField.when) {
      if (
        evaluateCondition(whenClause.condition, recordData, objectMetadataMaps)
      ) {
        return whenClause.value;
      }
    }

    return conditionalField.default;
  } catch {
    return conditionalField.default;
  }
}

function evaluateCondition(
  condition: Condition,
  recordData: RecordData,
  objectMetadataMaps: ObjectMetadataMaps,
): boolean {
  try {
    if ('field' in condition) {
      return evaluateFieldCondition(condition, recordData, objectMetadataMaps);
    }

    if ('and' in condition || 'or' in condition || 'not' in condition) {
      return evaluateLogicalCondition(
        condition,
        recordData,
        objectMetadataMaps,
      );
    }

    throw new Error(`Unknown condition type: ${JSON.stringify(condition)}`);
  } catch {
    return false;
  }
}

export function evaluateFieldCondition(
  condition: FieldCondition,
  recordData: RecordData,
  objectMetadataMaps: ObjectMetadataMaps,
): boolean {
  const resolvedField = resolveField(condition.field, objectMetadataMaps, {
    shouldThrowOnError: true,
  })!;
  const rawFieldValue = recordData[resolvedField.fieldName];

  let fieldValue = extractComparableValue(rawFieldValue);

  const fieldMetadata = getFieldMetadata(condition.field, objectMetadataMaps);

  if (fieldMetadata) {
    fieldValue = extractFieldValue(rawFieldValue, fieldMetadata.type);
  }

  const conditionValue = condition.value;

  switch (condition.operator) {
    case Operator.EQ:
      return fieldValue === conditionValue;

    case Operator.NE:
      return fieldValue !== conditionValue;

    case Operator.GT:
    case Operator.GTE:
    case Operator.LT:
    case Operator.LTE:
      return evaluateComparisonOperation(
        fieldValue,
        conditionValue,
        condition.operator,
      );

    default:
      throw new Error(`Unsupported operator: ${condition.operator}`);
  }
}

function evaluateLogicalCondition(
  condition: LogicalCondition,
  recordData: RecordData,
  objectMetadataMaps: ObjectMetadataMaps,
): boolean {
  if (condition.and) {
    return condition.and.every((subCondition) =>
      evaluateCondition(subCondition, recordData, objectMetadataMaps),
    );
  }

  if (condition.or) {
    return condition.or.some((subCondition) =>
      evaluateCondition(subCondition, recordData, objectMetadataMaps),
    );
  }

  if (condition.not) {
    return !evaluateCondition(condition.not, recordData, objectMetadataMaps);
  }

  throw new Error('Logical condition must have and, or, or not property');
}

function evaluateComparisonOperation(
  fieldValue: PrimitiveValue,
  conditionValue: PrimitiveValue,
  operator: Operator.GT | Operator.GTE | Operator.LT | Operator.LTE,
): boolean {
  if (!areComparableValues(fieldValue, conditionValue)) {
    return false;
  }

  switch (operator) {
    case Operator.GT:
      return fieldValue! > conditionValue!;
    case Operator.GTE:
      return fieldValue! >= conditionValue!;
    case Operator.LT:
      return fieldValue! < conditionValue!;
    case Operator.LTE:
      return fieldValue! <= conditionValue!;
  }
}

function areComparableValues(
  left: PrimitiveValue,
  right: PrimitiveValue,
): boolean {
  if (left === null || right === null) {
    return false;
  }

  const leftType = typeof left;
  const rightType = typeof right;

  return (
    leftType === rightType ||
    (leftType === 'number' && rightType === 'number') ||
    (left instanceof Date && right instanceof Date)
  );
}

function extractComparableValue(
  value: PrimitiveValue | PrimitiveValue[],
): PrimitiveValue {
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : null;
  }

  return value;
}

function extractFieldValue(
  rawValue: PrimitiveValue | PrimitiveValue[],
  fieldType: FieldMetadataType,
): PrimitiveValue {
  switch (fieldType) {
    case FieldMetadataType.CURRENCY:
      return extractCurrencyValue(rawValue);
    default:
      return extractComparableValue(rawValue);
  }
}

function extractCurrencyValue(
  rawValue: PrimitiveValue | PrimitiveValue[],
): PrimitiveValue {
  if (typeof rawValue === 'number') {
    return rawValue;
  }

  if (rawValue && typeof rawValue === 'object') {
    const amountMicros = (
      rawValue as unknown as { amountMicros: string | number }
    ).amountMicros;

    return typeof amountMicros === 'string'
      ? Number(amountMicros) / 1000000
      : amountMicros;
  }

  return rawValue;
}
