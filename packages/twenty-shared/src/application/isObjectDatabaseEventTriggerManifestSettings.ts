import { type DatabaseEventTriggerManifestSettings } from '@/application/databaseEventTriggerManifestSettingsType';
import { type ObjectDatabaseEventTriggerManifestSettings } from '@/application/objectDatabaseEventTriggerManifestSettingsType';

export const isObjectDatabaseEventTriggerManifestSettings = (
  settings: DatabaseEventTriggerManifestSettings,
): settings is ObjectDatabaseEventTriggerManifestSettings =>
  'action' in settings;
