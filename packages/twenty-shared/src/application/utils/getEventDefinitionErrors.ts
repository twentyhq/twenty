import { EVENT_LIMITS } from '@/application/constants/EventLimits';
import { EVENT_NAME_PATTERN } from '@/application/constants/EventNamePattern';
import { EVENT_PROPERTY_TYPES } from '@/application/constants/EventPropertyTypes';
import { type EventPropertyManifest } from '@/application/eventManifestType';
import { isValidUniversalIdentifier } from '@/application/utils/isValidUniversalIdentifier';

export const getEventDefinitionErrors = ({
  name,
  properties,
}: {
  name: string;
  properties: EventPropertyManifest[];
}): string[] => {
  const errors: string[] = [];

  if (!EVENT_NAME_PATTERN.test(name)) {
    errors.push(
      `Event name "${name}" must be camelCase and match ${EVENT_NAME_PATTERN}`,
    );
  }

  if (!Array.isArray(properties)) {
    errors.push(`Event "${name}" properties must be an array`);

    return errors;
  }

  if (properties.length > EVENT_LIMITS.MAX_PROPERTIES_PER_EVENT) {
    errors.push(
      `Event "${name}" cannot have more than ${EVENT_LIMITS.MAX_PROPERTIES_PER_EVENT} properties`,
    );
  }

  const propertyNames = new Set<string>();

  for (const property of properties) {
    if (!EVENT_NAME_PATTERN.test(property.name)) {
      errors.push(
        `Event "${name}" property "${property.name}" must be camelCase and match ${EVENT_NAME_PATTERN}`,
      );
    }

    if (propertyNames.has(property.name)) {
      errors.push(
        `Event "${name}" declares property "${property.name}" more than once`,
      );
    }

    propertyNames.add(property.name);

    if (!EVENT_PROPERTY_TYPES.includes(property.type)) {
      errors.push(
        `Event "${name}" property "${property.name}" type must be one of: ${EVENT_PROPERTY_TYPES.join(', ')}`,
      );
    }

    if (
      property.type === 'RECORD_REFERENCE' &&
      !isValidUniversalIdentifier(property.objectUniversalIdentifier ?? '')
    ) {
      errors.push(
        `Event "${name}" property "${property.name}" must set objectUniversalIdentifier to the universalIdentifier of an object`,
      );
    }
  }

  return errors;
};
