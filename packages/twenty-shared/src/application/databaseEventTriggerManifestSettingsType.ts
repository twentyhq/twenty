import { type DatabaseEventTriggerSettings } from '@/application/logicFunctionManifestType';

export type DatabaseEventTriggerManifestAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'destroyed'
  | 'restored'
  | 'upserted'
  | '*';

export type ObjectDatabaseEventTriggerManifestSettings = {
  // Every object when left out; a condition needs one object to read
  objectUniversalIdentifier?: string;
  action: DatabaseEventTriggerManifestAction;
  fieldUniversalIdentifiers?: string[];
  condition?: string;
  batchMode?: boolean;
};

// eventName and updatedFields stay accepted for one release
export type DatabaseEventTriggerManifestSettings =
  | ObjectDatabaseEventTriggerManifestSettings
  | DatabaseEventTriggerSettings;

export const isObjectDatabaseEventTriggerManifestSettings = (
  settings: DatabaseEventTriggerManifestSettings,
): settings is ObjectDatabaseEventTriggerManifestSettings =>
  'action' in settings;
