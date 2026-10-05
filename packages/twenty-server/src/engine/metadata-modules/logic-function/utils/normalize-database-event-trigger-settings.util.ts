import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// Manifests built with older SDKs and older API clients send a single trigger object
export const normalizeDatabaseEventTriggerSettings = (
  databaseEventTriggerSettings:
    | DatabaseEventTriggerSettings
    | DatabaseEventTriggerSettings[]
    | null
    | undefined,
): DatabaseEventTriggerSettings[] | null => {
  if (!isDefined(databaseEventTriggerSettings)) {
    return null;
  }

  return Array.isArray(databaseEventTriggerSettings)
    ? databaseEventTriggerSettings
    : [databaseEventTriggerSettings];
};
