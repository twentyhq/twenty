import { isObject } from '@sniptt/guards';

import { EVENT_LIMITS } from '@/application/constants/EventLimits';
import { EVENT_NAME_PATTERN } from '@/application/constants/EventNamePattern';
import { EVENT_SCHEMA_PROPERTY_TYPES } from '@/application/constants/EventSchemaPropertyTypes';
import { EVENT_SCHEMA_STRING_FORMATS } from '@/application/constants/EventSchemaStringFormats';
import { isValidUniversalIdentifier } from '@/application/utils/isValidUniversalIdentifier';
import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isDefined } from '@/utils/validation/isDefined';

const NESTED_SCHEMA_KEYWORDS = [
  'properties',
  'items',
  'additionalProperties',
] as const;

const getEventSchemaPropertyErrors = ({
  eventName,
  propertyName,
  propertySchema,
}: {
  eventName: string;
  propertyName: string;
  propertySchema: InputJsonSchema;
}): string[] => {
  const errors: string[] = [];
  const label = `Event "${eventName}" property "${propertyName}"`;

  if (!EVENT_NAME_PATTERN.test(propertyName)) {
    errors.push(`${label} must be camelCase and match ${EVENT_NAME_PATTERN}`);
  }

  if (!isObject(propertySchema)) {
    errors.push(`${label} must be described by a schema object`);

    return errors;
  }

  const { type, format, objectUniversalIdentifier } = propertySchema;

  if (
    isDefined(type) &&
    !(EVENT_SCHEMA_PROPERTY_TYPES as readonly string[]).includes(type)
  ) {
    errors.push(
      `${label} type must be one of: ${EVENT_SCHEMA_PROPERTY_TYPES.join(', ')}, or left out to accept any JSON value`,
    );
  }

  for (const keyword of NESTED_SCHEMA_KEYWORDS) {
    if (isDefined(propertySchema[keyword])) {
      errors.push(
        `${label} cannot use "${keyword}": event properties are flat`,
      );
    }
  }

  if (
    isDefined(format) &&
    (type !== 'string' ||
      !(EVENT_SCHEMA_STRING_FORMATS as readonly string[]).includes(format))
  ) {
    errors.push(
      `${label} format must be one of: ${EVENT_SCHEMA_STRING_FORMATS.join(', ')}, on a string property`,
    );
  }

  if (
    type === 'record' &&
    !isValidUniversalIdentifier(objectUniversalIdentifier ?? '')
  ) {
    errors.push(
      `${label} must set objectUniversalIdentifier to the universalIdentifier of an object`,
    );
  }

  return errors;
};

export const getEventDefinitionErrors = ({
  name,
  schema,
}: {
  name: string;
  schema: InputJsonSchema;
}): string[] => {
  const errors: string[] = [];

  if (!EVENT_NAME_PATTERN.test(name)) {
    errors.push(
      `Event name "${name}" must be camelCase and match ${EVENT_NAME_PATTERN}`,
    );
  }

  // Manifests reach the server as JSON, so the declared type is not a guarantee
  if (!isObject(schema) || schema.type !== 'object') {
    errors.push(`Event "${name}" schema must be an object schema`);

    return errors;
  }

  const properties = schema.properties ?? {};

  if (!isObject(properties)) {
    errors.push(`Event "${name}" schema properties must be an object`);

    return errors;
  }

  const propertyEntries = Object.entries(properties);

  if (propertyEntries.length > EVENT_LIMITS.MAX_PROPERTIES_PER_EVENT) {
    errors.push(
      `Event "${name}" cannot have more than ${EVENT_LIMITS.MAX_PROPERTIES_PER_EVENT} properties`,
    );
  }

  for (const [propertyName, propertySchema] of propertyEntries) {
    errors.push(
      ...getEventSchemaPropertyErrors({
        eventName: name,
        propertyName,
        propertySchema,
      }),
    );
  }

  for (const requiredName of schema.required ?? []) {
    if (!Object.prototype.hasOwnProperty.call(properties, requiredName)) {
      errors.push(
        `Event "${name}" requires "${requiredName}", which is not one of its properties`,
      );
    }
  }

  return errors;
};
