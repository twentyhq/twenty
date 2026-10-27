import { validate as uuidValidate } from 'uuid';

import {
  type EventPropertyManifest,
  type EventPropertyType,
} from '@/application/eventManifestType';

const isValueOfPropertyType = (
  value: unknown,
  type: EventPropertyType,
): boolean => {
  switch (type) {
    case 'TEXT':
      return typeof value === 'string';
    case 'NUMBER':
      return typeof value === 'number' && Number.isFinite(value);
    case 'BOOLEAN':
      return typeof value === 'boolean';
    case 'DATE_TIME':
      return typeof value === 'string' && !Number.isNaN(Date.parse(value));
    case 'UUID':
    case 'RECORD_REFERENCE':
      return typeof value === 'string' && uuidValidate(value);
    case 'RAW_JSON':
      return true;
  }
};

export const getEventPropertyValuesErrors = ({
  eventName,
  properties,
  values,
}: {
  eventName: string;
  properties: EventPropertyManifest[];
  values: Record<string, unknown>;
}): string[] => {
  const errors: string[] = [];
  const propertiesByName = new Map(
    properties.map((property) => [property.name, property]),
  );

  for (const valueName of Object.keys(values)) {
    if (!propertiesByName.has(valueName)) {
      errors.push(`Event "${eventName}" has no property "${valueName}"`);
    }
  }

  for (const property of properties) {
    const value = values[property.name];

    if (value === undefined || value === null) {
      if (property.isRequired === true) {
        errors.push(
          `Event "${eventName}" property "${property.name}" is required`,
        );
      }
      continue;
    }

    if (!isValueOfPropertyType(value, property.type)) {
      errors.push(
        `Event "${eventName}" property "${property.name}" must be a ${property.type} value`,
      );
    }
  }

  return errors;
};
