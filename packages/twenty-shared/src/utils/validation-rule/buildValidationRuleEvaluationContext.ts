import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from '@/constants/ValidationRulePreviousVariableName';
import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';
import { getValidationRulePreviousValueFieldPath } from '@/utils/validation-rule/getValidationRulePreviousValueFieldPath';
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

export const buildValidationRuleEvaluationContext = ({
  record,
  previousRecord,
  fieldByName,
  identifierPaths,
  now,
  isPreviousRecordContext = false,
}: {
  record: Record<string, unknown>;
  previousRecord?: Record<string, unknown>;
  fieldByName: ReadonlyMap<string, ValidationRuleFieldDescriptor>;
  identifierPaths: string[];
  now: string;
  isPreviousRecordContext?: boolean;
}): EvaluationContainer => {
  const context: EvaluationContainer = {};
  const ownedContainers = new WeakSet<object>();

  const previousValuePaths = isPreviousRecordContext
    ? []
    : identifierPaths
        .map(getValidationRulePreviousValueFieldPath)
        .filter(isDefined);

  if (previousValuePaths.length > 0) {
    context[VALIDATION_RULE_PREVIOUS_VARIABLE_NAME] =
      buildValidationRuleEvaluationContext({
        record: previousRecord ?? {},
        fieldByName: isDefined(previousRecord) ? fieldByName : new Map(),
        identifierPaths: previousValuePaths,
        now,
        isPreviousRecordContext: true,
      });
  }

  for (const path of identifierPaths) {
    const segments = path.split('.');
    const [rootSegment] = segments;

    if (!isDefined(rootSegment)) {
      continue;
    }

    // After previous. every name is a field, as after a relation
    if (!isPreviousRecordContext) {
      if (rootSegment === VALIDATION_RULE_PREVIOUS_VARIABLE_NAME) {
        continue;
      }

      if (rootSegment === VALIDATION_RULE_NOW_VARIABLE_NAME) {
        context[VALIDATION_RULE_NOW_VARIABLE_NAME] = now;
        continue;
      }
    }

    const rootField = fieldByName.get(rootSegment);

    if (!(rootSegment in context)) {
      const rootValue = normalizeLeafValue(record[rootSegment], rootField);

      registerCompositeValue(rootValue, rootField);
      context[rootSegment] = rootValue;
    }

    let container: EvaluationContainer | null = context;

    for (const [index, segment] of segments.entries()) {
      if (!isDefined(container)) {
        break;
      }

      if (index === segments.length - 1) {
        container[segment] = normalizeLeafValue(
          container[segment],
          index === 0
            ? rootField
            : rootField?.relationTargetFields?.find(
                (field) => field.name === segment,
              ),
        );
        break;
      }

      container = descendIntoContainer(container, segment, ownedContainers);

      const nextSegment = segments[index + 1];

      if (index === 0 && isDefined(container) && isDefined(nextSegment)) {
        const targetField = rootField?.relationTargetFields?.find(
          (field) => field.name === nextSegment,
        );

        registerCompositeValue(container[nextSegment], targetField);
      }
    }
  }

  return context;
};
