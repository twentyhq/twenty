import { type DatabaseEventTriggerSettings } from '@/application/logicFunctionManifestType';
import { type ObjectDatabaseEventTriggerManifestSettings } from '@/application/objectDatabaseEventTriggerManifestSettingsType';

// eventName and updatedFields stay accepted for one release
export type DatabaseEventTriggerManifestSettings =
  | ObjectDatabaseEventTriggerManifestSettings
  | DatabaseEventTriggerSettings;
