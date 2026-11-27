import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { validate as uuidValidate } from 'uuid';

import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isDefined } from '@/utils/validation/isDefined';

const isValueOfPropertySchema = ({
  value,
  propertySchema,
}: {
  value: unknown;
  propertySchema: InputJsonSchema;
}): boolean => {
  switch (propertySchema.type) {
    case 'string':
      if (!isString(value)) {
        return false;
      }

      if (propertySchema.format === 'date-time') {
        return !Number.isNaN(Date.parse(value));
      }

      return propertySchema.format === 'uuid' ? uuidValidate(value) : true;
    case 'number':
      return isNumber(value) && Number.isFinite(value);
    case 'integer':
      return isNumber(value) && Number.isInteger(value);
    case 'boolean':
      return isBoolean(value);
    case 'record':
      return isString(value) && uuidValidate(value);
    default:
      return true;
  }
};

const getPropertyConstraintErrors = ({
  value,
  propertySchema,
  label,
}: {
  value: unknown;
  propertySchema: InputJsonSchema;
  label: string;
}): string[] => {
  const errors: string[] = [];
  const { enum: allowedValues, minimum, maximum } = propertySchema;

  if (isDefined(allowedValues) && !allowedValues.includes(value)) {
    errors.push(`${label} must be one of: ${allowedValues.join(', ')}`);
  }

  if (isNumber(value) && isDefined(minimum) && value < minimum) {
    errors.push(`${label} must be at least ${minimum}`);
  }

  if (isNumber(value) && isDefined(maximum) && value > maximum) {
    errors.push(`${label} must be at most ${maximum}`);
  }

  return errors;
};

export const getEventPropertyValuesErrors = ({
  eventName,
  schema,
  values,
}: {
  eventName: string;
  schema: InputJsonSchema;
  values: Record<string, unknown>;
}): string[] => {
  const errors: string[] = [];
  const properties = schema.properties ?? {};
  const requiredNames = new Set(schema.required ?? []);
  const isDeclared = (name: string) =>
    Object.prototype.hasOwnProperty.call(properties, name);

  for (const valueName of Object.keys(values)) {
    if (!isDeclared(valueName)) {
      errors.push(`Event "${eventName}" has no property "${valueName}"`);
    }
  }

  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    const label = `Event "${eventName}" property "${propertyName}"`;
    // Inherited members such as constructor are not part of the payload
    const value = Object.prototype.hasOwnProperty.call(values, propertyName)
      ? values[propertyName]
      : undefined;

    if (!isDefined(value)) {
      if (requiredNames.has(propertyName)) {
        errors.push(`${label} is required`);
      }
      continue;
    }

    if (!isValueOfPropertySchema({ value, propertySchema })) {
      errors.push(
        `${label} must be a ${propertySchema.format ?? propertySchema.type} value`,
      );
      continue;
    }

    errors.push(
      ...getPropertyConstraintErrors({ value, propertySchema, label }),
    );
  }

  return errors;
};
