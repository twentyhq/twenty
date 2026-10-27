import { isBoolean, isNumber, isString } from '@sniptt/guards';
import { validate as uuidValidate } from 'uuid';

import {
  type EventPropertyManifest,
  type EventPropertyType,
} from '@/application/eventManifestType';
import { isDefined } from '@/utils/validation/isDefined';

const isValueOfPropertyType = (
  value: unknown,
  type: EventPropertyType,
): boolean => {
  switch (type) {
    case 'TEXT':
      return isString(value);
    case 'NUMBER':
      return isNumber(value) && Number.isFinite(value);
    case 'BOOLEAN':
      return isBoolean(value);
    case 'DATE_TIME':
      return isString(value) && !Number.isNaN(Date.parse(value));
    case 'UUID':
    case 'RECORD_REFERENCE':
      return isString(value) && uuidValidate(value);
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

    if (!isDefined(value)) {
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
