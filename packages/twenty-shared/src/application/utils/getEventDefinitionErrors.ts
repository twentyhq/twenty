import { isArray, isNumber, isObject, isString } from '@sniptt/guards';

import { EVENT_CAPABILITY_NAMES } from '@/application/constants/EventCapabilityNames';
import { EVENT_LIMITS } from '@/application/constants/EventLimits';
import { EVENT_NAME_PATTERN } from '@/application/constants/EventNamePattern';
import { EVENT_REALTIME_SCOPE_KINDS } from '@/application/constants/EventRealtimeScopeKinds';
import { EVENT_SCHEMA_PROPERTY_TYPES } from '@/application/constants/EventSchemaPropertyTypes';
import { EVENT_SCHEMA_STRING_FORMATS } from '@/application/constants/EventSchemaStringFormats';
import { type EventCapabilitiesManifest } from '@/application/eventManifestType';
import { isValidUniversalIdentifier } from '@/application/utils/isValidUniversalIdentifier';
import { type InputJsonSchema } from '@/logic-function/input-json-schema.type';
import { isDefined } from '@/utils/validation/isDefined';

const isEventSchemaPropertyType = (type: string) =>
  EVENT_SCHEMA_PROPERTY_TYPES.some((propertyType) => propertyType === type);

const isEventSchemaStringFormat = (format: string) =>
  EVENT_SCHEMA_STRING_FORMATS.some((stringFormat) => stringFormat === format);

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

  const { type, format, objectUniversalIdentifier, minimum, maximum } =
    propertySchema;

  if (isDefined(type) && !isEventSchemaPropertyType(type)) {
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

  if (isDefined(propertySchema.enum) && !isArray(propertySchema.enum)) {
    errors.push(`${label} enum must be an array of allowed values`);
  }

  for (const [keyword, bound] of [
    ['minimum', minimum],
    ['maximum', maximum],
  ] as const) {
    if (isDefined(bound) && !(isNumber(bound) && Number.isFinite(bound))) {
      errors.push(`${label} ${keyword} must be a number`);
    }
  }

  if (
    isDefined(format) &&
    (type !== 'string' || !isEventSchemaStringFormat(format))
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

const getEventCapabilitiesErrors = ({
  eventName,
  schema,
  capabilities,
}: {
  eventName: string;
  schema: InputJsonSchema;
  capabilities: EventCapabilitiesManifest;
}): string[] => {
  const errors: string[] = [];

  for (const capabilityName of Object.keys(capabilities)) {
    if (!EVENT_CAPABILITY_NAMES.includes(capabilityName)) {
      errors.push(
        `Event "${eventName}" declares capability "${capabilityName}", which is not supported`,
      );
    }
  }

  const scopeKeys = new Set<string>();

  for (const scope of capabilities.realtime?.scopes ?? []) {
    if (!EVENT_REALTIME_SCOPE_KINDS.includes(scope.kind)) {
      errors.push(
        `Event "${eventName}" realtime scope kind must be one of: ${EVENT_REALTIME_SCOPE_KINDS.join(', ')}`,
      );
      continue;
    }

    const scopeKey =
      scope.kind === 'record' ? `record:${scope.property}` : scope.kind;

    if (scopeKeys.has(scopeKey)) {
      errors.push(
        `Event "${eventName}" declares realtime scope "${scopeKey}" twice`,
      );
    }

    scopeKeys.add(scopeKey);

    if (
      scope.kind === 'record' &&
      schema.properties?.[scope.property]?.type !== 'record'
    ) {
      errors.push(
        `Event "${eventName}" record scope must name a record property, got "${scope.property}"`,
      );
    }
  }

  return errors;
};

export const getEventDefinitionErrors = ({
  name,
  schema,
  capabilities,
}: {
  name: string;
  schema: InputJsonSchema;
  capabilities?: EventCapabilitiesManifest | null;
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

  const required = schema.required ?? [];

  if (!isArray(required) || !required.every(isString)) {
    errors.push(`Event "${name}" schema required must be a list of names`);

    return errors;
  }

  for (const requiredName of required) {
    if (!Object.prototype.hasOwnProperty.call(properties, requiredName)) {
      errors.push(
        `Event "${name}" requires "${requiredName}", which is not one of its properties`,
      );
    }
  }

  if (isDefined(capabilities)) {
    errors.push(
      ...getEventCapabilitiesErrors({ eventName: name, schema, capabilities }),
    );
  }

  return errors;
};
