import { EVENT_LIMITS } from '@/application/constants/EventLimits';
import { EVENT_NAME_PATTERN } from '@/application/constants/EventNamePattern';
import { EVENT_PROPERTY_TYPES } from '@/application/constants/EventPropertyTypes';
import { EVENT_REALTIME_SCOPE_KINDS } from '@/application/constants/EventRealtimeScopeKinds';
import {
  type EventCapabilitiesManifest,
  type EventPropertyManifest,
} from '@/application/eventManifestType';
import { isValidUniversalIdentifier } from '@/application/utils/isValidUniversalIdentifier';

export const getEventDefinitionErrors = ({
  name,
  properties,
  capabilities,
}: {
  name: string;
  properties: EventPropertyManifest[];
  capabilities?: EventCapabilitiesManifest | null;
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

  const scopes = capabilities?.realtime?.scopes ?? [];
  const scopeKeys = new Set<string>();

  for (const scope of scopes) {
    if (!EVENT_REALTIME_SCOPE_KINDS.includes(scope.kind)) {
      errors.push(
        `Event "${name}" realtime scope kind must be one of: ${EVENT_REALTIME_SCOPE_KINDS.join(', ')}`,
      );
      continue;
    }

    const scopeKey =
      scope.kind === 'record' ? `record:${scope.property}` : scope.kind;

    if (scopeKeys.has(scopeKey)) {
      errors.push(
        `Event "${name}" declares realtime scope "${scopeKey}" twice`,
      );
    }

    scopeKeys.add(scopeKey);

    if (scope.kind !== 'record') {
      continue;
    }

    const referencedProperty = properties.find(
      (property) => property.name === scope.property,
    );

    if (referencedProperty?.type !== 'RECORD_REFERENCE') {
      errors.push(
        `Event "${name}" record scope must name a RECORD_REFERENCE property, got "${scope.property}"`,
      );
    }
  }

  return errors;
};
