import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type ValidationRuleEvaluationIdentifierPath } from '@/types/ValidationRuleEvaluationIdentifierPath';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { type ValidationRuleResolvedIdentifierPath } from '@/types/ValidationRuleResolvedIdentifierPath';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';
import {
  validationRuleCompositeFieldTypeByValue,
  validationRuleNullPlaceholders,
} from '@/utils/validation-rule/validationRuleValueRegistry';

type EvaluationContainer = Record<string, unknown>;

const normalizeLeafValue = (
  value: unknown,
  field: ValidationRuleFieldDescriptor | undefined,
): unknown => {
  if (!isDefined(value)) {
    return field?.type === FieldMetadataType.BOOLEAN ? false : null;
  }

  return value instanceof Date ? value.toISOString() : value;
};

const isEvaluationContainer = (value: unknown): value is EvaluationContainer =>
  isPlainObject(value) && !(value instanceof Date);

const registerCompositeValue = (
  value: unknown,
  field: ValidationRuleFieldDescriptor | undefined,
) => {
  if (
    isDefined(field) &&
    isEvaluationContainer(value) &&
    compositeTypeDefinitions.has(field.type)
  ) {
    validationRuleCompositeFieldTypeByValue.set(value, field.type);
  }
};

const descendIntoContainer = (
  container: EvaluationContainer,
  key: string,
  ownedContainers: WeakSet<object>,
): EvaluationContainer | null => {
  const value = container[key];

  if (!isDefined(value)) {
    const nullPlaceholder: EvaluationContainer = {};

    validationRuleNullPlaceholders.add(nullPlaceholder);
    ownedContainers.add(nullPlaceholder);
    container[key] = nullPlaceholder;

    return nullPlaceholder;
  }

  if (!isEvaluationContainer(value)) {
    return null;
  }

  if (ownedContainers.has(value)) {
    return value;
  }

  const ownedCopy = { ...value };

  const compositeFieldType = validationRuleCompositeFieldTypeByValue.get(value);

  if (isDefined(compositeFieldType)) {
    validationRuleCompositeFieldTypeByValue.set(ownedCopy, compositeFieldType);
  }

  ownedContainers.add(ownedCopy);
  container[key] = ownedCopy;

  return ownedCopy;
};

type EvaluationLevel = {
  contextKey: string;
  recordKey: string;
  field: ValidationRuleFieldDescriptor | undefined;
};

const computeEvaluationLevels = ({
  segments,
  resolvedPath,
}: {
  segments: string[];
  resolvedPath: Extract<
    ValidationRuleResolvedIdentifierPath,
    { type: 'field' }
  >;
}): EvaluationLevel[] => {
  const [rootSegment, targetFieldSegment] = segments;
  const { rootField, targetField, subfieldName } = resolvedPath;

  if (!isDefined(rootSegment)) {
    return [];
  }

  const rootLevel: EvaluationLevel = {
    contextKey: rootSegment,
    recordKey: rootField.name,
    field: rootField,
  };
  const targetFieldLevels: EvaluationLevel[] =
    isDefined(targetField) && isDefined(targetFieldSegment)
      ? [
          {
            contextKey: targetFieldSegment,
            recordKey: targetField.name,
            field: targetField,
          },
        ]
      : [];
  const subfieldLevels: EvaluationLevel[] = isDefined(subfieldName)
    ? [{ contextKey: subfieldName, recordKey: subfieldName, field: undefined }]
    : [];

  return [rootLevel, ...targetFieldLevels, ...subfieldLevels];
};

export const buildValidationRuleEvaluationContext = ({
  record,
  identifierPaths,
  now,
}: {
  record: Record<string, unknown>;
  identifierPaths: ValidationRuleEvaluationIdentifierPath[];
  now: string;
}): EvaluationContainer => {
  const context: EvaluationContainer = {};
  const ownedContainers = new WeakSet<object>();

  for (const { segments, resolvedPath } of identifierPaths) {
    if (resolvedPath.type === 'now') {
      context[VALIDATION_RULE_NOW_VARIABLE_NAME] = now;
      continue;
    }

    const levels = computeEvaluationLevels({ segments, resolvedPath });
    const [rootLevel] = levels;

    if (!isDefined(rootLevel)) {
      continue;
    }

    if (!(rootLevel.contextKey in context)) {
      const rootValue = normalizeLeafValue(
        record[rootLevel.recordKey],
        rootLevel.field,
      );

      registerCompositeValue(rootValue, rootLevel.field);
      context[rootLevel.contextKey] = rootValue;
    }

    let container: EvaluationContainer | null = context;

    for (const [index, level] of levels.entries()) {
      if (!isDefined(container)) {
        break;
      }

      if (index > 0) {
        if (!(level.contextKey in container)) {
          container[level.contextKey] = container[level.recordKey];
        }

        registerCompositeValue(container[level.contextKey], level.field);
      }

      if (index === levels.length - 1) {
        container[level.contextKey] = normalizeLeafValue(
          container[level.contextKey],
          level.field,
        );
        break;
      }

      container = descendIntoContainer(
        container,
        level.contextKey,
        ownedContainers,
      );
    }
  }

  return context;
};
