import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isDefined } from '@/utils/validation/isDefined';
import {
  validationRuleCompositeFieldTypeByValue,
  validationRuleNullPlaceholders,
} from '@/utils/validation-rule/validationRuleValueRegistry';

type EvaluationContainer = Record<string, unknown>;

const normalizeLeafValue = (value: unknown): unknown => {
  if (value === undefined) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
};

const isPlainObject = (value: unknown): value is EvaluationContainer =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date);

const registerCompositeValue = (
  value: unknown,
  field: ValidationRuleFieldDescriptor | undefined,
) => {
  if (
    isDefined(field) &&
    isPlainObject(value) &&
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

  if (!isPlainObject(value)) {
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
  fields,
  identifierPaths,
  now,
}: {
  record: Record<string, unknown>;
  fields: ValidationRuleFieldDescriptor[];
  identifierPaths: string[];
  now: string;
}): EvaluationContainer => {
  const context: EvaluationContainer = {};
  const ownedContainers = new WeakSet<object>();

  for (const path of identifierPaths) {
    const segments = path.split('.');
    const [rootSegment] = segments;

    if (rootSegment === VALIDATION_RULE_NOW_VARIABLE_NAME) {
      context[VALIDATION_RULE_NOW_VARIABLE_NAME] = now;
      continue;
    }

    const rootField = fields.find((field) => field.name === rootSegment);

    if (!(rootSegment in context)) {
      const rootValue = normalizeLeafValue(record[rootSegment]);

      registerCompositeValue(rootValue, rootField);
      context[rootSegment] = rootValue;
    }

    let container: EvaluationContainer | null = context;

    for (const [index, segment] of segments.entries()) {
      if (container === null) {
        break;
      }

      if (index === segments.length - 1) {
        container[segment] = normalizeLeafValue(container[segment]);
        break;
      }

      container = descendIntoContainer(container, segment, ownedContainers);

      if (index === 0 && container !== null) {
        const targetField = rootField?.relationTargetFields?.find(
          (field) => field.name === segments[1],
        );

        registerCompositeValue(container[segments[1]], targetField);
      }
    }
  }

  return context;
};
