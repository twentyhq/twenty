import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

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
